/** CarSupplierSchema handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let SupplierSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    email: {
      type: String,
      validate: {
        validator: uniqueValidtor("user", "email"),
        message: "Email already exist"
      },
      unique: true,
      required: [true, "Email is required"]
    },
    address: { type: String },
    avatar: { type: String },
    mobile: {
      type: String,
      validate: {
        validator: uniqueValidtor("user", "mobile"),
        message: "Mobile already exist"
      },
      unique: true,
      required: [true, "Mobile number is required"]
    },
    username: {
      type: String,
      validate: {
        validator: uniqueValidtor("user", "username"),
        message: "Username already exist"
      },
      unique: true,
      required: [true, "Username name is required"]
    },
    password: { type: String, required: [true, "Password not provided"] },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false },
    freeCollection: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

SupplierSchema.pre("save", function(next) {
  let user = this;

  return helper.createHash(user.password, function(err, hash) {
    if (!err) {
      user.password = hash;
      return next();
    } else {
      return next(err);
    }
  });
});

export const SupplierModel = mongoose.model("supplier", SupplierSchema);