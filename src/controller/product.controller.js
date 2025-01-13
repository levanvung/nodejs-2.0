"use strict";
const ProductService = require("../services/product.service");
const { OK, CREATED } = require("../core/success.response");
class ProductController {
  createProduct = async (req, res, next) => {
    new CREATED({
      message: "Product created",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishOneProduct = async (req, res, next) => {
    new CREATED({
      message: "Product published",
      metadata: await ProductService.publishProduct({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  unPublishOneProduct = async (req, res, next) => {
    new CREATED({
      message: "Product UnPublished",
      metadata: await ProductService.unPublishProduct({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  //QUERY //
  /**
   * @description get all draft products
   */
  getAllDraftForShop = async (req, res, next) => {
    new OK({
      message: "get All draft products",
      metadata: await ProductService.getProductDrafts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPushlishedForShop = async (req, res, next) => {
    new OK({
      message: "get All published products",
      metadata: await ProductService.getProductPushlist({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new CREATED({
      message: "search success",
      metadata: await ProductService.searchProduct(req.params),
    }).send(res);
  };
  // END QUERY //

  findAllProducts = async (req, res, next) => {
    new OK({
      message: "get all products",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  findOneProducts = async (req, res, next) => {
    new OK({
      message: "get detail products",
      metadata: await ProductService.finOneProducts({product_id: req.params.product_id})
    }).send(res);
  };
}

module.exports = new ProductController();
