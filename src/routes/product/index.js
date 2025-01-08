'use strict'
const {authentication} = require('../../auth/authUtilts')
const express = require('express')
const productController = require('../../controller/product.controller')
const {asyncHandler} = require('../../helpers/asyncHandler')
const router = express.Router()
router.use(authentication)
// create product 
router.post('/product/create', asyncHandler(productController.createProduct))

router.get('/product/draft', asyncHandler(productController.getAllDraftForShop))
module.exports = router