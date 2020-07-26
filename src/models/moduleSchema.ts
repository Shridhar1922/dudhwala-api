/** Module schema contains project modules and their actions */
var mongoose = require("mongoose");

let ModuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    actions: { type: Array },
    isDeleted:{ type:Boolean, default:false }
  },
  {  }
);

export const UserModel = mongoose.model("module", ModuleSchema);
