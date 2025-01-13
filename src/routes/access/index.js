'use strict'
const {authentication} = require('../../auth/authUtilts')
const express = require('express')
const accessController = require('../../controller/access.controller')
const {asyncHandler} = require('../../helpers/asyncHandler')
const router = express.Router()

// signUP 

router.use(authentication)
router.post('/shop/login', asyncHandler(accessController.login))
router.post('/shop/signup', asyncHandler(accessController.signUp))
//authentication
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/refreshToken', asyncHandler(accessController.refreshToken))

module.exports = router