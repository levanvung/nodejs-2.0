"use-strict";

const { product, clothing, electronic } = require("../../models/product.model");
const { Types } = require("mongoose");
const {getSelectData} = require("../../utils/index");
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
  return modifiedCount;
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
  return modifiedCount;
};

const  findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort == 'ctime' ? { _id: -1 } : { id: 1 };
  const products = await product.find( filter)
  .sort(sortBy)
  .skip(skip)
  .limit(limit)
  .select(getSelectData(select))
  .lean()
  
  return products;
}

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const searchProductByUser = async ({ keySearch, limit, skip }) => {
  if (typeof keySearch !== 'string') {
    throw new Error("keySearch phải là một chuỗi");
  }
  const regexSearch = new RegExp(keySearch);
  const results = await product
  .find({
    isDraft: false,
    $text: { $search: regexSearch }
  },
  { score: { $meta: "textScore" } })
  .sort({ score: { $meta: "textScore" } })
  .limit(limit)
  .lean()
  .exec()
   
  return results;
};
module.exports = {
  findAllDraftsForShop,
  publishProductForShop,
  findAllPushlishForShop,
  UnpublishProductForShop,
  searchProductByUser,
  findAllProducts
};
