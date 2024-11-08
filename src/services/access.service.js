"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtilts");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {
  static async signUp({ name, email, password }) {
    try {
      // check email exist
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: '20002',
          message: 'Email đã tồn tại',
          status: 'error'
        };
      }

      // hash password
      const hashPassword = await bcrypt.hash(password, 10);

      // create shop
      const newShop = await shopModel.create({
        name,
        email,
        password: hashPassword,
        roles: [RoleShop.SHOP]
      });

      if (newShop) {
        // created privateKey, publicKey
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096
        });
        console.log({ privateKey, publicKey });

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey
        });

        if (!publicKeyString) {
          return {
            code: '20003',
            message: 'Tạo key token thất bại'
          };
        }

        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
        console.log(`Created token success:`, tokens);

        return {
          code: '201',
          metadata: {
            shop: newShop,
            tokens
          }
        };
      }

      return {
        code: 201,
        metadata: null
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error"
      };
    }
  }
}

module.exports = AccessService;
