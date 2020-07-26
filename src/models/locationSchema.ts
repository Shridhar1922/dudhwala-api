/** Location handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let LocationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      validate: {
        validator: uniqueValidtor("location", "address"),
        message: "location already exist"
      },
      unique: true,
      required: [true, "address name is required"]
    },

    latitude: { type: String, required: [true, "latitude is required"] },
    longitude: {
      type: String,
      required: [true, "longitude model is required"]
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },

    isDeleted: { type: Boolean, default: false },

    isAvailable: { type: Boolean, default: true },

    freeCollection: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const LocationModel = mongoose.model("location", LocationSchema);
