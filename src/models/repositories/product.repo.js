"use-strict";

const { product, clothing, electronic } = require("../../models/product.model");
const { Types, model } = require("mongoose");
const { getSelectData, unGetSelectData } = require("../../utils/index");
const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const findAllPushlishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const publishProductForShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });
  if (!foundShop) throw new Error("Product not found");
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};
const UnpublishProductForShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });
  if (!foundShop) throw new Error("Product not found");
  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort == "ctime" ? { _id: -1 } : { id: 1 };
  
  // Make sure product_images is included in the select array if provided
  if (select && !select.includes('product_images')) {
    select.push('product_images');
  }
  
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .select('isDraft isPublished')
    .lean();

  return products;
};

const findProduct = async ({ unSelect, product_id }) => {
  return await product
    .findById(product_id)
    .select(unGetSelectData(unSelect))
    .select('isDraft isPublished product_shop product_name product_price product_thumb product_images')
    .lean()
    .exec()
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .select('product_name product_thumb product_images product_description product_price product_quantity product_type product_shop product_attributes isDraft isPublished createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const searchProductByUser = async ({ keySearch, limit = 50, skip = 0 }) => {
  if (typeof keySearch !== "string") {
    throw new Error("keySearch phải là một chuỗi");
  }

  // Kiểm tra xem keySearch có phải là một loại sản phẩm không
  const productTypes = ["Electronics", "Clothing", "Furniture", "Laptop", "iPhone", "AirPort"];
  const isProductType = productTypes.includes(keySearch);

  let searchQuery;

  if (isProductType) {
    // Tìm kiếm theo product_type
    searchQuery = {
      isDraft: false,
      isPublished: true,
      product_type: keySearch
    };
  } else {
    // Tìm kiếm theo tên và mô tả (sử dụng text index)
    searchQuery = {
      isDraft: false,
      isPublished: true,
      $text: { $search: keySearch }
    };
  }

  // Nếu là tìm kiếm text, sử dụng score để sắp xếp
  const options = isProductType ? {} : { score: { $meta: "textScore" } };
  
  const results = await product
    .find(searchQuery, options)
    .select('product_name product_thumb product_images product_description product_price product_quantity product_type product_shop product_attributes isDraft isPublished createdAt updatedAt')
    .sort(isProductType ? { updatedAt: -1 } : { score: { $meta: "textScore" } })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  return results;
};

const updateProductById = async ({ product_id, bodyUpdate, model }) => {
  return await model.findByIdAndUpdate(
    product_id,
    { $set: bodyUpdate },
    { new: true }
  );
};

// Cập nhật số lượng sản phẩm khi thêm vào giỏ hàng
const updateProductQuantity = async ({ productId, quantity }) => {
  return await product.findByIdAndUpdate(
    productId,
    { $inc: { product_quantity: -quantity } },
    { new: true }
  );
};

module.exports = {
  findAllDraftsForShop,
  publishProductForShop,
  findAllPushlishForShop,
  UnpublishProductForShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  updateProductQuantity
};
