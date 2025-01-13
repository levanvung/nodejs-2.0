"use-strict";

const { product, clothing, electronic } = require("../models/product.model");
const {
  findAllDraftsForShop,
  publishProductForShop,
  findAllPushlishForShop,
  searchProductByUser,
  UnpublishProductForShop,
  findAllProducts,
} = require("../models/repositories/product.repo");
// define Factory class to create product

class ProductFactory {
  static productRegistry = {};

  static registerProduct(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }
  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new Error(`Invalid product type ${type}`);
    }
    return await new productClass(payload).createProduct();
  }

  // PUSHLISH PRODUCT

  static async publishProduct({ product_id, product_shop }) {
    return await publishProductForShop({ product_id, product_shop });
  }
  static async unPublishProduct({ product_id, product_shop }) {
    return await UnpublishProductForShop({ product_id, product_shop });
  }
  // search product

  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  // GET DRAFTS PRODUCTS
  static async getProductDrafts({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  // get published products

  static async getProductPushlist({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPushlishForShop({ query, limit, skip });
  }

  // find all products

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: [
        "product_name",
        "product_thumb",
        "product_price",
      ],
    });
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

// Defind sub-class for differrent product types clothing

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new Error("Cannot create new clothing");
    }
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
}
class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) {
      throw new Error("Cannot create new clothing");
    }
    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
}
ProductFactory.registerProduct("Clothing", Clothing);
ProductFactory.registerProduct("Electronics", Electronics);

module.exports = ProductFactory;
