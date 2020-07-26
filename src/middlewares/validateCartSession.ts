import authService from "../libs/authService";

import Security from "../libs/security";
export const validateCartSession = async (req: any, res: any, next: any) => {
  try {
    let token = req.body.nonce;
    if (Security.isValidNonce(token, req)) {
      next();
    } else {
      res.status(401).send({
        success: false,
        message: "Action is not permitted!",
        data: null
      });
    }
  } catch (e) {
    console.log("Error occured while authorizing..", e);
    res.status(401).send({
      success: false,
      message: "Action is not permitted!",
      data: null
    });
  }
};
