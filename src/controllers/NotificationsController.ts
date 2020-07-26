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
import { NotificationRepository } from "../repositories/notificationRepository";
import { authorizeAction } from "../middlewares/authorizeAction";

@Authorized()
@JsonController("/notification")
export class NotificationController {
  constructor(public notificationRepository: NotificationRepository) {
    this.notificationRepository = new NotificationRepository();
  }

  // for admin   (add count for number of cars supplier can add)
  @UseBefore(authorizeAction("notification", "create"))
  @Post("/")
  async store(@Body() body: any, @Req() req: any) {
    try {
      let { carCount } = body;

      carCount = typeof carCount === "string" && carCount ? carCount : "";
      if (carCount) {
        const result = await this.notificationRepository.store(body);

        return {
          success: true,
          message: "notification added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "notification is requred"
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

  //@UseBefore(authorizeAction("notification", "read"))
  @Get("/")
  async findAll(@QueryParams() params: any, @Res() res: any) {
    try {
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;

      const result = await this.notificationRepository.findAll(
        Object.assign({}, params)
      );

      return {
        success: true,
        message: "notification",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  // for admin   (set notification Read/Unread)
  @UseBefore(authorizeAction("notification", "update"))
  @Put("/:id")
  async update(@Param("id") id: string, @Body() body: any) {
    try {
      let { read } = body;

      //console.log("Location Update REQUESTs..", body);

      if (id) {
        const result = await this.notificationRepository.update({ id }, body);

        return {
          success: true,
          message: "notification readed",
          data: result
        };
      } else {
        return {
          success: false,
          message: "notification id is requred"
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
      console.log("error", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  @UseBefore(authorizeAction("notification", "read"))
  @Get("/getUnreadNotificationsCount")
  async findUnreadNotificationCount(
    @QueryParams() params: any,
    @Res() res: any
  ) {
    try {
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;

      const result = await this.notificationRepository.findUnreadNotificationCount(
        Object.assign({}, params)
      );

      return {
        success: true,
        message: "Unread notification count",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
