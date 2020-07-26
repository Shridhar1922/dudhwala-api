/** Module schema contains project modules and their actions */
var mongoose = require("mongoose");

let RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: { type: Object, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toObject: {
      transform: function(doc, ret) {}
    }
  }
);

export const RoleModel = mongoose.model("role", RoleSchema);
