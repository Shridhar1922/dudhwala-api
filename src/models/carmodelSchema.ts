/** Car Model handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let CarModelSchema = new mongoose.Schema(
  {
    name: {
      type: String
      // validate: {
      //   validator: uniqueValidtor("carModel", "name"),
      //   message: "Car Model already exist"
      // },
      // unique: true,
      // required: [true, "Car model is required"]
    },

    make: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carMake"
    },

    features: [{ type: mongoose.Schema.Types.ObjectId, ref: "carFeature" }],
    //features: [{ type: String }], //fixed features

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const CarmodelModel = mongoose.model("carModel", CarModelSchema);
