'use strict'

const cartModel = require('../models/cart.model')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { findProduct, updateProductQuantity } = require('../models/repositories/product.repo')
const { product } = require('../models/product.model')
const { checkProductStock, reduceProductStock } = require('../models/repositories/inventory.repo')

class CartService {
    // Thêm sản phẩm vào giỏ hàng
    static async addToCart({ userId, product }) {
        // Kiểm tra product ID
        const productData = await findProduct({ product_id: product.productId, unSelect: [] })
        if (!productData) {
            throw new NotFoundError('Product not found')
        }

        // Kiểm tra xem sản phẩm có được publish hay không
        if (!productData.isPublished) {
            throw new BadRequestError('Cannot add unpublished product to cart')
        }

        // Kiểm tra các trường bắt buộc của sản phẩm
        if (!productData.product_shop) {
            throw new BadRequestError('Product shop information is missing')
        }
        if (!productData.product_name) {
            throw new BadRequestError('Product name is missing')
        }
        if (productData.product_price === undefined || productData.product_price === null) {
            throw new BadRequestError('Product price is missing')
        }

        // Xác định số lượng sản phẩm yêu cầu
        const requestQuantity = product.quantity || 1;

        // Kiểm tra giỏ hàng hiện tại
        const userCart = await cartModel.findOne({ userId });
        let currentQuantity = 0;

        // Nếu sản phẩm đã có trong giỏ, cộng thêm số lượng hiện tại
        if (userCart) {
            const existingProduct = userCart.products.find(p => 
                p.productId.toString() === product.productId.toString()
            );
            if (existingProduct) {
                currentQuantity = existingProduct.quantity;
            }
        }

        // Tổng số lượng sản phẩm cần kiểm tra
        const totalQuantityNeeded = requestQuantity + currentQuantity;

        // Kiểm tra số lượng sản phẩm trong kho
        const stockCheck = await checkProductStock({ 
            productId: product.productId, 
            quantity: totalQuantityNeeded 
        });

        if (!stockCheck.isEnough) {
            // Trả về mã lỗi cụ thể dựa trên status code
            if (stockCheck.statusCode === 'OUT_OF_STOCK') {
                throw new BadRequestError('Sản phẩm đã hết');
            } else if (stockCheck.statusCode === 'NOT_FOUND_INVENTORY') {
                throw new BadRequestError('Sản phẩm không tồn tại trong kho');
            } else {
                throw new BadRequestError(stockCheck.message);
            }
        }

        // Log để debug
        console.log('Product found:', productData)

        // Chuẩn bị dữ liệu sản phẩm để thêm vào giỏ hàng
        const cartProduct = {
            productId: product.productId,
            shopId: productData.product_shop,
            quantity: requestQuantity,
            name: productData.product_name,
            price: productData.product_price,
            thumb: productData.product_thumb || ''
        }

        // Cập nhật số lượng sản phẩm trong database
        await updateProductQuantity({
            productId: product.productId,
            quantity: requestQuantity
        });

        // Kiểm tra giỏ hàng của user
        if (!userCart) {
            // Tạo giỏ hàng mới
            return await cartModel.create({
                userId,
                products: [cartProduct],
                modifiedOn: new Date()
            })
        }

        // Giỏ hàng đã tồn tại, kiểm tra sản phẩm đã có trong giỏ chưa
        const existingProductIndex = userCart.products.findIndex(p => 
            p.productId.toString() === product.productId.toString()
        )

        if (existingProductIndex !== -1) {
            // Sản phẩm đã tồn tại, cập nhật số lượng
            userCart.products[existingProductIndex].quantity += requestQuantity
        } else {
            // Thêm sản phẩm mới vào giỏ
            userCart.products.push(cartProduct)
        }

        userCart.modifiedOn = new Date()
        return await userCart.save()
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    static async updateQuantity({ userId, productId, quantity }) {
        if (quantity <= 0) {
            throw new BadRequestError('Quantity must be greater than 0')
        }

        // Kiểm tra sản phẩm có tồn tại và đã publish chưa
        const productData = await findProduct({ product_id: productId, unSelect: [] })
        if (!productData) {
            throw new NotFoundError('Product not found')
        }

        if (!productData.isPublished) {
            throw new BadRequestError('Cannot update quantity for unpublished product')
        }

        // Kiểm tra số lượng trong kho
        const stockCheck = await checkProductStock({ 
            productId, 
            quantity 
        });

        if (!stockCheck.isEnough) {
            // Trả về mã lỗi cụ thể dựa trên status code
            if (stockCheck.statusCode === 'OUT_OF_STOCK') {
                throw new BadRequestError('Sản phẩm đã hết');
            } else if (stockCheck.statusCode === 'NOT_FOUND_INVENTORY') {
                throw new BadRequestError('Sản phẩm không tồn tại trong kho');
            } else {
                throw new BadRequestError(stockCheck.message);
            }
        }

        // Lấy thông tin giỏ hàng hiện tại để tính toán thay đổi số lượng
        const currentCart = await cartModel.findOne({ 
            userId, 
            'products.productId': productId 
        });
        
        if (!currentCart) {
            throw new NotFoundError('Product not found in cart');
        }
        
        const currentItem = currentCart.products.find(p => 
            p.productId.toString() === productId.toString()
        );
        
        if (!currentItem) {
            throw new NotFoundError('Product not found in cart');
        }
        
        // Tính toán thay đổi số lượng
        const quantityDifference = quantity - currentItem.quantity;
        
        // Nếu có thay đổi số lượng, cập nhật số lượng sản phẩm trong database
        if (quantityDifference !== 0) {
            await updateProductQuantity({
                productId,
                quantity: quantityDifference
            });
        }

        const query = {
            userId,
            'products.productId': productId
        }
        const updateSet = {
            $set: {
                'products.$.quantity': quantity,
                modifiedOn: new Date()
            }
        }

        const result = await cartModel.findOneAndUpdate(query, updateSet, { new: true })
        if (!result) {
            throw new NotFoundError('Product not found in cart')
        }

        return result
    }

    // Xóa sản phẩm khỏi giỏ hàng
    static async removeFromCart({ userId, productId }) {
        // Lấy thông tin giỏ hàng hiện tại để trả lại số lượng vào kho
        const currentCart = await cartModel.findOne({ 
            userId, 
            'products.productId': productId 
        });
        
        if (currentCart) {
            const currentItem = currentCart.products.find(p => 
                p.productId.toString() === productId.toString()
            );
            
            if (currentItem) {
                // Trả lại số lượng sản phẩm vào kho
                await updateProductQuantity({
                    productId,
                    quantity: -currentItem.quantity // Số âm để tăng quantity trong kho
                });
            }
        }

        const query = { userId }
        const updateSet = {
            $pull: {
                products: { productId }
            },
            $set: { modifiedOn: new Date() }
        }

        const result = await cartModel.findOneAndUpdate(query, updateSet, { new: true })
        if (!result) {
            throw new NotFoundError('Cart not found')
        }

        return result
    }

    // Lấy giỏ hàng của user
    static async getCart({ userId }) {
        const cart = await cartModel.findOne({ userId }).lean()
        
        if (!cart) {
            return null
        }
        
        // Lấy thêm product_attributes cho mỗi sản phẩm trong giỏ hàng
        const productIds = cart.products.map(p => p.productId)
        const productsWithAttributes = await product
            .find({ 
                _id: { $in: productIds },
                isPublished: true // Chỉ lấy sản phẩm đã publish
            })
            .select('_id product_attributes isPublished')
            .lean()
        
        // Tạo map để dễ dàng truy cập product_attributes và trạng thái publish
        const productMap = {}
        productsWithAttributes.forEach(p => {
            productMap[p._id.toString()] = {
                product_attributes: p.product_attributes,
                isPublished: p.isPublished
            }
        })
        
        // Lọc ra chỉ sản phẩm đã publish
        cart.products = cart.products
            .filter(p => {
                const productId = p.productId.toString()
                return productMap[productId] && productMap[productId].isPublished
            })
            .map(p => {
                const productId = p.productId.toString()
                return {
                    ...p,
                    product_attributes: productMap[productId]?.product_attributes || {}
                }
            })
        
        return cart
    }

    // Thực hiện thanh toán giỏ hàng
    static async checkout({ userId }) {
        // Lấy giỏ hàng hiện tại
        const userCart = await cartModel.findOne({ userId });
        if (!userCart || userCart.products.length === 0) {
            throw new BadRequestError('Cart is empty');
        }

        // Kiểm tra số lượng trong kho cho tất cả sản phẩm
        for (const item of userCart.products) {
            const stockCheck = await checkProductStock({
                productId: item.productId,
                quantity: item.quantity
            });

            if (!stockCheck.isEnough) {
                // Trả về mã lỗi cụ thể dựa trên status code
                if (stockCheck.statusCode === 'OUT_OF_STOCK') {
                    throw new BadRequestError(`Sản phẩm ${item.name} đã hết`);
                } else if (stockCheck.statusCode === 'NOT_FOUND_INVENTORY') {
                    throw new BadRequestError(`Sản phẩm ${item.name} không tồn tại trong kho`);
                } else {
                    throw new BadRequestError(`Sản phẩm ${item.name}: ${stockCheck.message}`);
                }
            }
        }

        // Giảm số lượng trong kho sau khi kiểm tra
        for (const item of userCart.products) {
            await reduceProductStock({
                productId: item.productId,
                quantity: item.quantity
            });
        }

        // Xóa giỏ hàng sau khi thanh toán
        await cartModel.findOneAndUpdate(
            { userId },
            { 
                $set: { 
                    products: [],
                    modifiedOn: new Date() 
                }
            }
        );

        return { success: true, message: 'Checkout completed successfully' };
    }
}

module.exports = CartService;