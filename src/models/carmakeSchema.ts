/** Car Make/manufacturers handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let CarMakeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      validate: {
        validator: uniqueValidtor("carMake", "name"),
        message: "CarMake already exist"
      },
      unique: true,
      required: [true, "Car Make is required"]
    },

    description: {
      type: String
    },

    logo: { type: String },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const CarMakeModel = mongoose.model("carMake", CarMakeSchema);
