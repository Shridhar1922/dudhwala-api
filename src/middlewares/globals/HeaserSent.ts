import * as express from "express";
import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware
} from "routing-controllers";

@Middleware({ type: "after" })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  isProduction = process.env.NODE_ENV === "production";

  constructor() {}

  error(
    error: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    // It seems like some decorators handle setting the response (i.e. class-validators)
    if (!res.headersSent) {
      res.status(error.httpCode || 500);

      res.json({
        name: error.name,
        message: error.message,
        errors: error["errors"] || []
      });
    }

    if (this.isProduction) {
      console.log(error.name, error.message);
    } else {
      console.log(error.name, error.stack);
    }
  }
}
