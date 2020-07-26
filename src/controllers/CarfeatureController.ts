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
import { carFeaturesRepository } from "../repositories/carfeaturesRepository";
import { authorizeAction } from "../middlewares/authorizeAction";
import * as fs from "fs";

@Authorized()
@JsonController("/carfeatures")
export class CarFeaturesController {
  constructor(public carfeaturesRepository: carFeaturesRepository) {
    this.carfeaturesRepository = new carFeaturesRepository();
  }

  // for admin   (add car Feature)
  @UseBefore(authorizeAction("carFeature", "create"))
  @Post("/")
  async store(@Body() body: any) {
    try {
      let { name, featureType } = body;

      console.log("car feature..", body);

      name = typeof name === "string" && name ? name : "";
      featureType =
        typeof featureType === "string" && featureType ? featureType : "";

      if (name && featureType) {
        const carFeatures = {
          name,
          featureType
        };

        const result = await this.carfeaturesRepository.store(carFeatures);

        return {
          success: true,
          message: "Car Feature added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Car feature is requred"
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

  @UseBefore(authorizeAction("carFeature", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.carfeaturesRepository.findOne({
          carFeature: id
        });
        if (result) {
          return {
            success: true,
            message: "Car feature",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not car feature for this id",
            data: null
          };
        }
      } else {
        return { success: true, message: "car feature id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("carFeature", "update"))
  @Put("/:id") // for admin   (edit carFeature API)
  async update(@Param("id") id: string, @Body() body: any) {
    try {
      let { name, featureType } = body;

      //console.log("Car Update REQUESTs..", body);
      name = typeof name === "string" && name ? name : "";
      featureType =
        typeof featureType === "string" && featureType ? featureType : "";

      if (name && featureType) {
        const result = await this.carfeaturesRepository.update({ id }, body);

        return {
          success: true,
          message: "Car Feature Updated successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Feature Type is requred"
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

  @UseBefore(authorizeAction("carFeature", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.carfeaturesRepository.softDelete(ids);
      return {
        success: true,
        message: "Car Feature deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  //get car feature by Feature type

  @UseBefore(authorizeAction("carFeature", "read"))
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      console.log("get all car Features...");
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.carfeaturesRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "Car Features",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
