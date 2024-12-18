"use-strict";
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIATION: "authorization",
};
const { findByUserId } = require("../services/keytoken.service");
const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("đây là lỗi", err);
      } else {
        console.log("đây là được", decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};
const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];

  if (!userId) {
    return res.status(401).json({ message: "Client id is required" });
  }
  
  const keyStore = await findByUserId(userId);
  console.log(keyStore, "@@@@@@@@@@@@@@@@");
  if (!keyStore) {
    return res.status(401).json({ message: "Client id is invalid" });
  }

  const accessToken = req.headers[HEADER.AUTHORIATION];
  if (!accessToken) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoudeUser = await JWT.verify(accessToken, keyStore.publicKey);
    if(userId !== decoudeUser.userId){
    return res.status(401).json({ message: "Invalid User)" });
    } 
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Access token is invalid)" });
  }
});
module.exports = {
  createTokenPair,
  authentication
};
