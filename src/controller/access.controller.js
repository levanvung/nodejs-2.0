'use strict';
const AccessService = require("../services/access.service");
class AcessController {
    async signUp(req, res, next) {
        return res.status(201).json(await AccessService.signUp(req.body));
    }
  }
  
  module.exports = new AcessController();
