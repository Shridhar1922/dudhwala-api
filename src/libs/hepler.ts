import { type } from "os";

var bcrypt = require("bcryptjs");
var config = require("../config");

export const createHash = function(plainText, callback) {
  if (typeof plainText === "string") {
    bcrypt.genSalt(config.SALT_ROUNDS, function(err, salt) {
      bcrypt.hash(plainText, salt, function(err, hash) {
        callback(null, hash);
      });
    });
  } else {
    callback("Invalid string");
  }
};

export const compareHash = function(plainText, hash) {
  return new Promise(resolve => {
    bcrypt.compare(plainText, hash, function(err, res) {
      if (!err && res) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export const isBase64 = string => {
  return new Promise(resolve => {
    try {
      return resolve(btoa(atob(string)) == string);
    } catch (err) {
      return resolve(false);
    }
  });
};

export const findInArray = (key, value, array) => {
  array = array instanceof Array ? array : [];
  const fils = array.filter(element => {
    typeof element === "object" ? element : {};
    return element[key] === value;
  });
  console.log("list", fils.length);
  return fils.length;
};

export const makeid = (length = 15) => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  console.log("mength", length);
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

export const pad = (n, width, z = "0") => {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

export const capId = (length = 15) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  console.log("mength", length);
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};
