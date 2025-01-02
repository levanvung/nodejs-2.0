"use strict";
const ProductSerivce = require("../services/product.service");
const { OK, CREATED } = require("../core/success.response");
class ProductController {
  createProduct = async (req, res, next) => {
    new CREATED({
      message: "Product created",
      metadata: await ProductSerivce.createProduct(
        req.body.product_type,
        req.body
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
