/** Category  handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      validate: {
        validator: uniqueValidtor("product", "name"),
        message: "product already exist"
      },
      unique: true,
      required: [true, "name is required"]
    },

    description: { type: String },
    price: {
        type: Number,
        required: [true, "price is required"]
      },
      FAT: {
        type: Number,
        required: [true, "price is required"]
      },
      supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },

    productType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productType"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category"
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subcategory"
      },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const ProductTypeModel = mongoose.model(
  "product",
  productSchema
);
