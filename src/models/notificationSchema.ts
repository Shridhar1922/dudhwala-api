/** NotificationSchema handles user CRUD operations */

var mongoose = require("mongoose");
var helper = require("../libs/hepler");
var mongoose = require("mongoose");
import { uniqueValidtor } from "../libs/validator";

let NotificationSchema = new mongoose.Schema(
  {
    title: { type: String },
    avatar: {
      type: String,
      default:
        "https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png"
    },
    notificationFor: { type: String },
    type: { type: String, default: "notification" },
    isDeleted: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    redirectTo: { type: String }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const NotificationModel = mongoose.model(
  "notification",
  NotificationSchema
);
