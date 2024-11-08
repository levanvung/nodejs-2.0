'use strict'

const express = require('express')
const accessController = require('../../controller/access.controller')
const router = express.Router()

// signUP 
router.post('/shop/signup', accessController.signUp)

module.exports = router