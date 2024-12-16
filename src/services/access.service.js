"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtilts");
const { getInfoData } = require("../utils");
const { BadRequestError, ConflictError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  // đăng nhập
  static login = async ({  email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Email không tồn tại");
    }
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new BadRequestError("Mật khẩu không đúng");
    }

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    })
    return {
        shop: getInfoData({
          fileds: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens,
    };
  };

  //đăng ký
  static signUp = async ({ name, email, password }) => {
    // try {
    // check email exist
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Email đã tồn tại");
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // create shop
    const newShop = await shopModel.create({
      name,
      email,
      password: hashPassword,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      //thuật toán này xịn
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      // Public key CryptoGraphy Standards !

      //cách đơn giản
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey });

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new ConflictError("Tạo key thất bại");
      }
      // const publicKeyObject = crypto.createPublicKey(publicKeyString);

      // console.log(publicKeyObject, " publicKeyObject 22222222222222");

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log(`Created token success:`, tokens);

      return {
        code: "201",
        metadata: {
          shop: getInfoData({
            fileds: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    // return {
    //   code: 201,
    //   metadata: null,
    // };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = AccessService;
