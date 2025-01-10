"use-strict";

const { product, clothing, electronic } = require("../../models/product.model");
const { Types } = require("mongoose");
const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const findAllPushlishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const publishProductForShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });
  if (!foundShop) throw new Error("Product not found");
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount
};
const UnpublishProductForShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });
  if (!foundShop) throw new Error("Product not found");
  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount
};
const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}
module.exports = { findAllDraftsForShop, publishProductForShop, findAllPushlishForShop, UnpublishProductForShop };
