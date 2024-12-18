'use strict'
const {authentication} = require('../../auth/authUtilts')
const express = require('express')
const accessController = require('../../controller/access.controller')
const {asyncHandler} = require('../../helpers/asyncHandler')
const router = express.Router()

// signUP 
router.post('/shop/login', asyncHandler(accessController.login))
router.post('/shop/signup', asyncHandler(accessController.signUp))
router.use(authentication)
//authentication
router.post('/shop/logout', asyncHandler(accessController.logout))

module.exports = router