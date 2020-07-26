/** Car limit Schema to handles limit of cars any supplier can add */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");

let carAddCountLimitSchema = new mongoose.Schema(
  {
    carCount: {
      type: Number,
      required: [true, "car add limit is required"]
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const carAddCountLimitModel = mongoose.model(
  "carAddCount",
  carAddCountLimitSchema
);
