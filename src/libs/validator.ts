var mongoose = require("mongoose");
export const uniqueValidtor = (schema, field) => async value => {
  const count = await mongoose.model(schema).countDocuments({ [field]: value });
  return !count;
};
