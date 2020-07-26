import authService from "../libs/authService";
import { Action } from "routing-controllers";
export const authorizationChecker = async (action: Action) => {
  const authHead = action.request.headers["authorization"];
if(!authHead)
{
  return false;
}

  let token = authHead.split(" ")[1];
  if (!token) {
    return false;
  }
  try {
    const decoded = await authService.verifyToken(token);
    if (decoded) {
      action.request["user"] = decoded;
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
