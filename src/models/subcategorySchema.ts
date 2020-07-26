/** Category  handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let subCategorySchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      validate: {
        validator: uniqueValidtor("subcategory", "name"),
        message: "Subcategory already exist"
      },
      unique: true,
      required: [true, "name is required"]
    },

    description: { type: String },
    productType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productType"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category"
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
  "subcategory",
  subCategorySchema
);
