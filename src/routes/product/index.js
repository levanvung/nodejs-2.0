'use strict'
const {authentication} = require('../../auth/authUtilts')
const express = require('express')
const productController = require('../../controller/product.controller')
const {asyncHandler} = require('../../helpers/asyncHandler')
const router = express.Router()

// create product 
router.post('/product/create', asyncHandler(productController.createProduct))


module.exports = router