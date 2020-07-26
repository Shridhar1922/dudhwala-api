var jwt = require("jsonwebtoken");
var config = require("../config");
let lib = {};

export default {
  /** Creates a token JWT token
   * @param userDetails
   * @param callback Error first callback function
   */
  createToken: function(userDetails) {
    return new Promise((resolve, reject) => {
      if (typeof userDetails === "object") {
        let { username, email, role, mobile,userType } = userDetails;
        let token = jwt.sign(
          { data: { username, email, role, mobile,userType } },
          config.SECRET,
          {
            expiresIn: "72h"
          }
        );
        if (token) {
          resolve(token);
          return;
        } else {
          reject("Could not create token");
          return;
        }
      } else {
        reject("User details are not valid, expecting a user object");
        return;
      }
    });
  },

  /** Verify a token
   * @param token
   * @param callback Error first callback function
   * @returns user object
   */
  verifyToken: function(token) {
    return new Promise((resolve, reject) => {
      if (typeof token === "string" && token.length) {
        jwt.verify(token, config.SECRET, function(err, decoded) {
          if (!err) {
            resolve(decoded);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  },

  /* createTokenForSupplier: function(userDetails) {
    return new Promise((resolve, reject) => {
      if (typeof userDetails === "object") {
        let { username, email, mobile } = userDetails;
        let token = jwt.sign(
          { data: { username, email, mobile } },
          config.SECRET,
          {
            expiresIn: "72h"
          }
        );
        if (token) {
          resolve(token);
          return;
        } else {
          reject("Could not create token");
          return;
        }
      } else {
        reject("User details are not valid, expecting a user object");
        return;
      }
    });
  }, */

};
