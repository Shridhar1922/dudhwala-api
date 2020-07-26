/** Car Schema handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");

let CarSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: [true, "Company name is required"] },
    carDescription: { type: String },
    make: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carMake",
      required: [true, "car make is required"]
    },
    modelNo: { type: String, required: [true, "car model name is required"] },
    seater: { type: Number },
    doors: { type: Number },
    gears: { type: Number },
    airBags: { type: Number },
    carNo: {
      type: String,
      unique: true,
      required: [true, "car number is required"]
    },
    //carRegistrationNo: { type: String, unique: true },
    carType: { type: String },
    // carRegistrationLicenseNo: {
    //   type: String,
    //   unique: true,
    //   required: [true, "Car registration license number is required"]
    // },
    hourlyRent: {
      type: String
      //required: [true, "Rent for a hour is required"]
    },
    dailyRent: {
      type: String
      //required: [true, "Rent for daily booking is required"]
    },
    outstationRent: {
      type: String
      //required: [true, "Rent for outstations is required"]
    },
    hourlyAvailbilityTime: {
      type: String
      // required: [
      //   true,
      //   "availability time for hourly booking option is required"
      // ]
    },
    dailyAvailbilityTime: { type: String, default: "next day" },
    outstationAvailbilityTime: { type: String, default: "next day" },
    fuelType: { type: String },
    mileage: { type: String },
    ac: { type: String },
    status: { type: String, default: "pending" },

    rejectReason: { type: String, default: "" },

    features: [{ type: mongoose.Schema.Types.ObjectId, ref: "carFeature" }],

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

    supplierName: { type: String },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },

    images: [
      {
        name: String,
        path: String,
        thumb: String
      }
    ],
    documents: {
      carInsurance: String,
      carInsurancepath: String,
      insuranceNumber: String,
      insuranceIssuedDate: String,
      insuranceExpiryDate: String,
      carRegistrationLicense: String,
      carRegistrationLicenseNo: String,
      carRegistrationLicensepath: String,
      carRegistrationLicenseIssuedDate: String,
      carRegistrationLicenseExpiryDate: String,
      carAvailableFromDate: { type: String },
      carAvailableToDate: { type: String }
    },
    // carAvailableFromDate: { type: String },
    // carAvailableToDate: { type: String },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      role: [true, "Role not provided"]
    },
    isDeleted: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    freeCollection: { type: Boolean, default: true },
    isPublished: { type: String, default: "unpublished" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
  { createdDateLocal: { type: String } },
  { updatedDateLocal: { type: String } }
);

export const CarModel = mongoose.model("car", CarSchema);
