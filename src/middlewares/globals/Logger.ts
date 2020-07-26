import * as express from "express";
import {
  ExpressMiddlewareInterface,
  HttpError,
  Middleware,
  Body
} from "routing-controllers";
const StringDecoder = require("string_decoder").StringDecoder;
@Middleware({ type: "before" })
export class Logger implements ExpressMiddlewareInterface {
  isProduction = process.env.NODE_ENV === "production";

  constructor() {}

  use(request: any, response: any, next?: (err?: any) => any): any {
    response.header("Access-Control-Allow-Origin", "*");
    next();
  }
}
