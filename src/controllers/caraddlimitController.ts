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
import { carAddCountRepository } from "../repositories/caraddlimitRepository";
import { authorizeAction } from "../middlewares/authorizeAction";

@Authorized()
@JsonController("/carcount")
export class CarAddCountController {
  constructor(public carCountRepository: carAddCountRepository) {
    this.carCountRepository = new carAddCountRepository();
  }

  // for admin   (add count for number of cars supplier can add)
  @UseBefore(authorizeAction("carAddCount", "create"))
  @Post("/")
  async store(@Body() body: any, @Req() req: any) {
    try {
      let { carCount } = body;

      console.log("car make..", body);
      carCount = typeof carCount === "string" && carCount ? carCount : "";
      if (carCount) {
        const result = await this.carCountRepository.store(body);
        return {
          success: true,
          message: "Car count added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Car count is requred"
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

  @UseBefore(authorizeAction("carAddCount", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.carCountRepository.findOne({
          carCount: id
        });
        if (result) {
          return {
            success: true,
            message: "Car count",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find any car count for this id",
            data: null
          };
        }
      } else {
        return { success: true, message: "car count id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("carAddCount", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.carCountRepository.softDelete(ids);
      return {
        success: true,
        message: "Car count deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("carAddCount", "read"))
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      console.log("get all car Makers...");
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.carCountRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "Car Makes",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("carMake", "update"))
  @Put("/:id") // for admin   (edit carMake API)
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @Req() req: any
  ) {
    try {
      let { carCount } = body;

      let update = {
        carCount
      };

      console.log("UPDATE CAR Count", update);

      if (carCount) {
        const result = await this.carCountRepository.update({ id }, update);

        return {
          success: true,
          message: "Car Count Updated successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Car count is requred"
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
}
