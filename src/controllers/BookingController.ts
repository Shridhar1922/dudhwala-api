import {
  JsonController,
  Get,
  Req,
  Res,
  Post,
  Put,
  Patch,
  Body,
  Delete,
  Param,
  QueryParams,
  UseBefore,
  Authorized,
  CurrentUser
} from "routing-controllers";

import { BookingRepository } from "../repositories/bookingRepository";
import { CarRepository } from "../repositories/carRepository";
import { authorizeAction } from "../middlewares/authorizeAction";

@Authorized()
@JsonController("/booking")
export class BookingController {
  constructor(public bookingRepository: BookingRepository) {
    this.bookingRepository = new BookingRepository();
  }

  @Post("/availbleCars")
  async store(@Body() body: any, @Res() res: any) {
    try {
      let { date } = body;

      console.log("date..", body);

      if (date) {
        const searchReq = {
          date
        };

        console.log("searchReq.......", searchReq);

        //const result = await this.bookingRepository.store(BookingRequest);

        // return {
        //   success: true,
        //   message: "Your booking request has been submitted successfully",
        //   data: result
        // };
      } else {
        return {
          success: false,
          message: "car Type, booking Option and car type are requred"
        };
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        return {
          success: false,
          message: err.message,
          data: null
        };
      }

      if (err.name === "MongoError" && err.code === 11000) {
        return {
          success: false,
          message: err.message,
          data: null
        };
      }
      console.log("eoror", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }
}
