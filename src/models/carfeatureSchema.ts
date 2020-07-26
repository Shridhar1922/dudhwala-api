/** Car Features handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let CarFeatureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      validate: {
        validator: uniqueValidtor("carFeature", "name"),
        message: "Car Feature already exist"
      },
      unique: true,
      required: [true, "Car Feature is required"]
    },

    featureType: { type: String, required: [true, "featureType is required"] },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const CarFeatureModel = mongoose.model("carFeature", CarFeatureSchema);
