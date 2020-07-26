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
import { carModelRepository } from "../repositories/carmodelRepository";
import { authorizeAction } from "../middlewares/authorizeAction";

@Authorized()
@JsonController("/carmodel")
export class CarModelController {
  constructor(public carmodelRepository: carModelRepository) {
    this.carmodelRepository = new carModelRepository();
  }

  // for admin   (add car model)
  @UseBefore(authorizeAction("carModel", "create"))
  @Post("/")
  async store(@Body() body: any, @Req() req: any) {
    try {
      let { name, make, features } = body;

      console.log("carModel..", body);

      name = typeof name === "string" && name ? name : "";
      //make = typeof make === "object" && make ? make : []; why not working?
      make = typeof make === "string" && make ? make : [];
      features = typeof features === "object" && features ? features : [];
      if (name) {
        const carModel = {
          name,
          make,
          features
        };

        const result = await this.carmodelRepository.store(carModel);

        return {
          success: true,
          message: "Car Model added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Car model is requred"
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

  @UseBefore(authorizeAction("carModel", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.carmodelRepository.findOne({
          carMake: id
        });
        if (result) {
          return {
            success: true,
            message: "Car Model",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not car model for this id",
            data: null
          };
        }
      } else {
        return { success: true, message: "carmodel id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("carModel", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.carmodelRepository.softDelete(ids);
      return {
        success: true,
        message: "Car Model deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("carModel", "read"))
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      console.log("get all car models...");
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.carmodelRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "Car Models",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("carModel", "update"))
  @Put("/:id") // for admin   (edit carModel API)
  async update(@Param("id") id: string, @Body() body: any) {
    try {
      let { name, make, features } = body;

      //console.log("Car Update REQUESTs..", body);
      name = typeof name === "string" && name ? name : "";
      make = typeof make === "string" && make ? make : "";
      features = typeof features === "string" && features ? features : "";

      if (name && make) {
        const result = await this.carmodelRepository.update({ id }, body);

        return {
          success: true,
          message: "Car Model Updated successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Car model is requred"
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

  @UseBefore(authorizeAction("carModel", "read"))
  @Get("/getModel-bycarMakeId/:id")
  async carmodel(@Param("id") id: string, @Res() res: any) {
    try {
      const carModels = await this.carmodelRepository.find({ id });
      if (carModels) {
        return res.send({
          success: true,
          message: "Car Model found",
          data: carModels
        });
      }
      return res.send({
        success: true,
        message: "Car model not found",
        data: {}
      });
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null });
    }
  }
}
