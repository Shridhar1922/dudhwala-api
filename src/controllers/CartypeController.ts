import {
  Post,
  Get,
  Put,
  Delete,
  JsonController,
  Authorized,
  Body,
  Res,
  UseBefore,
  Patch,
  Param,
  QueryParams,
  Req
} from "routing-controllers";
import { cartypeRepository } from "../repositories/cartypeRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import { authorizeAction } from "../middlewares/authorizeAction";
import * as fs from "fs";

//const pathToAttachment = `public/uploads/contract/عقد ايجار سيارة.pdf`;
//const attachment = fs.readFileSync(pathToAttachment).toString("base64");

@Authorized()
@JsonController("/cartype")
export class CarController {
  constructor(
    public carRepository: cartypeRepository,
    public notificationRepository: NotificationRepository
  ) {
    this.carRepository = new cartypeRepository();
    this.notificationRepository = new NotificationRepository();
  }

  @UseBefore(authorizeAction("carType", "create"))
  @Post("/") // for admin   (add car Type)
  async store(@Body() body: any, @Req() req) {
    try {
      let { name, description } = body;

      console.log("car type..", body);

      name = typeof name === "string" && name ? name : "";
      description =
        typeof description === "string" && description ? description : "";

      if (name) {
        const Car = {
          name,
          description
        };

        const result = await this.carRepository.store(Car);

        let notificationObj = {};
        notificationObj["notification"] = "New Car Type added.";

        notificationObj["notificationFor"] = "Admin";
        notificationObj["notificationType"] = "Add";

        //console.log("notificationObj...", notificationObj);

        const notification = await this.notificationRepository.store(
          notificationObj
        );
        const sendNotification = req.app.get("sendNotification");
        if (sendNotification) {
          sendNotification(notification);
        }

        // var sg = require("sendgrid")(
        //   "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"
        // );

        // var request = sg.emptyRequest({
        //   method: "POST",
        //   path: "/v3/mail/send",
        //   body: {
        //     personalizations: [
        //       {
        //         to: [
        //           {
        //             email: "chaitrali@webwideit.solutions"
        //           }
        //         ],
        //         subject: "Car rental"
        //       }
        //     ],
        //     from: {
        //       email: "chaitrali@webwideit.solutions",
        //       name: "Car rental"
        //     },
        //     content: [
        //       {
        //         type: "text/plain",
        //         value: "New Car Type added"
        //       }
        //     ],
        //     attachments: [
        //       {
        //         content: attachment,
        //         filename: "عقد ايجار سيارة.pdf",
        //         type: "application/pdf",
        //         disposition: "attachment"
        //       }
        //     ]
        //   }
        // });

        // //With callback
        // sg.API(request, function(error, response) {
        //   if (error) {
        //     //console.log('Error response received', error);
        //     //res(error);
        //   } else {
        //     console.log("response", response);
        //     console.log("success, Mail sent successfully");
        //   }
        // });

        return {
          success: true,
          message: "Car Type added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "car Type is requred"
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

  @UseBefore(authorizeAction("carType", "read"))
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      console.log("get all car types...");
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.carRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "All car types",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("carType", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.carRepository.findOne({ carType: id });
        if (result) {
          return {
            success: true,
            message: "Car type",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find car type for this id",
            data: null
          };
        }
      } else {
        return { success: true, message: "car id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("carType", "update"))
  @Put("/:id") // for admin   (edit carType API)
  async update(@Param("id") id: string, @Body() body: any) {
    try {
      let { name, description } = body;

      //console.log("Car Update REQUESTs..", body);
      name = typeof name === "string" && name ? name : "";
      description =
        typeof description === "string" && description ? description : "";

      //if (name && description) {
      const result = await this.carRepository.update({ id }, body);

      return {
        success: true,
        message: "Car Type Updated successfully",
        data: result
      };
      // } else {
      //   return {
      //     success: false,
      //     message: "car type is requred"
      //   };
      // }
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
      console.log("error", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  @UseBefore(authorizeAction("carType", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.carRepository.softDelete(ids);
      return {
        success: true,
        message: "Car type deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
