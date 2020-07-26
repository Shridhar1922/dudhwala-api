/** booking request Schema handles booking requets for user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");

let BookingSchema = new mongoose.Schema(
  {
    bookingOption: {
      type: String
    },
    fromDate: { type: Date },
    toDate: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "car"
    },
    carType: { type: String },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected", "canceled"]
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "done"]
    },
    createdDateLocal: { type: String },
    updatedDateLocal: { type: String },
    bookingID: { type: String },
    pickupLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "location",
        required: [true, "pick up Locations required"]
      }
    ],
    dropoffLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "location",
        required: [true, "drop off Locations required"]
      }
    ],
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    mobile: { type: String },
    fromTime: { type: String },
    toTime: { type: String }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
export const BookingModel = mongoose.model("booking", BookingSchema);
