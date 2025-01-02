'use-strict'

const {model, Schema, Types} = require('mongoose');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
    product_name : {type: String, required: true},
    product_thumb: {type: String, required: true},
    product_description: String,
    product_price: {type: Number, required: true},
    product_quantity: {type: Number, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
    product_type: {type: String, required: true},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    product_attributes: { type: Schema.Types.Mixed, default: {}, required: true },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
})

//define the produc type = clothing

const clothingSchema = new Schema({
    brand: {type: String, required: true},
    size: {type: String, required: true},
    color: {type: String, required: true},
    material: {type: String, required: true},
    }, {
    collection: 'clothes',
    timestamps: true,
})
//define the produc type = echonics

const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: {type: String, required: true},
    color: {type: String, required: true},
    }, {
    collection: 'electronics',
    timestamps: true,
})


module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronic', electronicSchema),

}