'use strict';
const AccessService = require("../services/access.service");
const {OK, CREATED} = require('../core/success.response')
class AcessController {
    async signUp(req, res, next) {
      new CREATED({
        message: "Register successfully",
        metadata : await AccessService.signUp(req.body),
        options: {
          limit: 10
        }
      }).send(res)
        // return res.status(201).json(await AccessService.signUp(req.body));
    }
  }
  
  module.exports = new AcessController();
