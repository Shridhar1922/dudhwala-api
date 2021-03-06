/** Car Types handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let CarTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      validate: {
        validator: uniqueValidtor("carType", "name"),
        message: "Car type already exist"
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

export const CarTypeModel = mongoose.model("carType", CarTypeSchema);
