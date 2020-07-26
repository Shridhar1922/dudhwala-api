import * as crypto from "crypto";
class Security {
  static md5(value) {
    if (!value) {
      return;
    }
    return crypto
      .createHash("md5")
      .update(value)
      .digest("hex");
  }

  static isValidNonce(value, req) {
    return value === this.md5(req.sessionID + req.headers["user-agent"]);
  }
}
export default Security;
