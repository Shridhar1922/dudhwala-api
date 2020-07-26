/** Category  handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let CategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      validate: {
        validator: uniqueValidtor("category", "name"),
        message: "Category already exist"
      },
      unique: true,
      required: [true, "name is required"]
    },

    description: { type: String },
    productType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productType"  
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

export const ProductTypeModel = mongoose.model("category", CategorySchema);
