"use strict";
const AccessService = require("../services/access.service");
class AcessController {
    async signUp(req, res, next) {
      try {
        console.log(`[p]::signUp::`, req.body);
        return res.status(201).json(await AccessService.signUp(req.body));
      } catch (error) {
        next(error);
      }
    }
  }
  
  module.exports = new AcessController();
