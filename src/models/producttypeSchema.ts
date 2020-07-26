/** Product Types handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let ProductTypeSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      validate: {
        validator: uniqueValidtor("productType", "name"),
        message: "Product type already exist"
      },
      unique: true,
      required: [true, "name is required"]
    },

    description: { type: String },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const ProductTypeModel = mongoose.model("productType", ProductTypeSchema);
