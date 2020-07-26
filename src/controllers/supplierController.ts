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
  HeaderParam,
  CurrentUser,
  Params
} from "routing-controllers";
import * as mongoose from "mongoose";
import * as helper from "../libs/hepler";

import { SupplierRepository } from "../repositories/supplierRepository";
import { BookingRepository } from "../repositories/bookingRepository";
import { UserRepository } from "../repositories/userRepositories";

import * as authService from "../libs/authService";
import { authorizeAction } from "../middlewares/authorizeAction";
import { CarRepository } from "../repositories/carRepository";
import * as fs from "fs";
import * as multer from "multer";
import * as randomstring from "randomstring";

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const dest = `uploads/documents/${file.fieldname}/`;
    try {
      if (!fs.existsSync(`public/${dest}`)) {
        fs.mkdirSync(`public/${dest}`);
      }

      callback(null, `public/${dest}`);
    } catch (e) {
      console.log(e.message);
    }
  },
  filename: function(req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + file.originalname.replace(" ", "_")
    );
  }
});

const upload = multer({ storage });

@Authorized()
@JsonController("/supplier")
export class supplierController {
  BookingRepository: any;
  UserRepository: any;
  carRepository: any;
  authService;

  constructor(public supplierRepository: SupplierRepository) {
    this.supplierRepository = new SupplierRepository();
  }
  //@UseBefore(authorizeAction("supplier", "update"))
  @Put("/:id")
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @CurrentUser() user: any
  ) {
    console.log("Logged in user", user);

    const bookingRepository = new BookingRepository();
    //const DATA = await bookingRepository.findOne(id);
    //console.log("DATA",DATA)
    if (user["userType"] == "supplier") {
      //console.log("IN IF")
      try {
        let { status } = body;
        if (status) {
          let update = {
            status
          };
        }

        const result = await bookingRepository.update(
          { id, supplier: user["_id"] },
          body
        );

        if (result) {
          // if (status === "approved") {
          //   // const carRepository = new CarRepository();
          //   // await carRepository.update(
          //   //   { id: result["car"] },
          //   //   { isAvailable: false }
          //   // );

          //   return {
          //     success: true,
          //     message:
          //       "Your booking request status has been updated successfully",
          //     data: result
          //   };
          // }

          if (status === "approved") {
            return {
              success: true,
              message: "Booking request has been approved successfully",
              data: result
            };
          } else if (status === "rejected") {
            return {
              success: true,
              message: "Booking request has been rejected.",
              data: result
            };
          }
        } else {
          return {
            success: false,
            message: "Could not update",
            data: null
          };
        }
      } catch (e) {
        console.log("error ", e.message);
        return { success: false, message: "Something went wrong", data: null };
      }
    } else {
      return {
        success: false,
        message: "you can not approve the request",
        data: null
      };
    }
  }

}
