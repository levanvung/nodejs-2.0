"use-strict";

const { product, clothing, electronic } = require("../models/product.model");

// define Factory class to create product

class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Clothing":
        return new Clothing(payload);
      case "Electronics":
        return new Electronics(payload);
      default:
        throw new Error("Invalid product type");
    }
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

  async createProduct() {
    return await product.create(this);
  }
}

// Defind sub-class for differrent product types clothing

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create(this.product_attributes);
    if (!newClothing) {
      throw new Error("Cannot create new clothing");
    }
    const newProduct = await super.createProduct();
    if(!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }

}
class Electronics extends Product {
    async createProduct() {
      const newElectronics = await electronic.create(this.product_attributes);
      if (!newElectronics) {
        throw new Error("Cannot create new clothing");
      }
      const newProduct = await super.createProduct();
      if(!newProduct) {
        throw new Error("Cannot create new product");
      }
        return newProduct;
    }
  }
  module.exports = ProductFactory;