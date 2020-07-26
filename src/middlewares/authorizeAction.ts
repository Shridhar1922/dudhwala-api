import authService from "../libs/authService";
import { Action } from "routing-controllers";
import { RoleRepository } from "../repositories/roleRepository";
export const authorizeAction = (
  module: string,
  requestAction: string
) => async (req: any, res: any, next: any) => {
  try {
    const authHead = req.headers["authorization"];
    if (!authHead) {
      return res.status(401).send({
        success: false,
        message: "Action is not permitted!",
        data: null
      });
    }
    let token = authHead.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Action is not permitted!",
        data: null
      });
    }
    console.log("\x1b[33m", "...", "\x1b[0m");
    let user = await authService.verifyToken(token);
    user = user["data"];
    console.log("user.............", user);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Action is not permitted! no token",
        data: null
      });
    }
    const roleRepository = new RoleRepository();
    // const permission = await roleRepository.chekPermissions(
    //   user["role"] ? user["role"]["name"] : "customer",
    //   module,
    //   requestAction
    // );
    const permission = true;
     
    console.log("PERMISSION", permission);
    if (permission === true) {
      // res.header("Access-Control-Allow-Origin", "*");
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
