import * as mongoose from "mongoose";
const Role = [
  {
    _id: mongoose.Types.ObjectId("5bf919e3c7bff015ea0a6cde"),
    isDeleted: false,
    name: "Admin",
    __v: 0,
    permissions: [
      {
        name: "user",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "role",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "location",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "car",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "carType",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "productType",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "carFeature",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "carMake",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "carModel",
        actions: ["create", "read", "update", "delete"]
      },
      {
        name: "carAddCount",
        actions: ["create", "read", "update", "delete"]
      }
    ]
  }
];

export default Role;
