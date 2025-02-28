// product.router.js
"use strict";
const { authentication } = require("../../auth/authUtilts");
const express = require("express");
const productController = require("../../controller/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

// Các route công khai
router.get("/product/search/:keySearch", asyncHandler(productController.getListSearchProduct));
router.get("/product/findAll", asyncHandler(productController.findAllProducts));
router.get("/product/findOne/:product_id", asyncHandler(productController.findOneProducts));

// Các route bảo vệ
router.post("/product/create", authentication, asyncHandler(productController.createProduct));
router.post("/product/published/:id", authentication, asyncHandler(productController.publishOneProduct));
router.post("/product/unpublished/:id", authentication, asyncHandler(productController.unPublishOneProduct));

router.get("/product/draft", authentication, asyncHandler(productController.getAllDraftForShop));
router.get("/product/published", authentication, asyncHandler(productController.getAllPushlishedForShop));
router.patch("/product/update/:product_id", authentication, asyncHandler(productController.updateProduct));

module.exports = router;
