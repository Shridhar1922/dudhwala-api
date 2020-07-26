import * as mongoose from "mongoose";
export default [
  {
    name: "user",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "role",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "supplier",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "car",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "booking",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "carType",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "carFeature",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "carMake",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "carModel",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "location",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  },
  {
    name: "carAddCount",
    actions: ["create", "read", "update", "delete"],
    isDeleted: false
  }
];
