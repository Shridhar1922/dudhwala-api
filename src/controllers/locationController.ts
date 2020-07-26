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
import { LocationRepository } from "../repositories/locationRepository";
import { authorizeAction } from "../middlewares/authorizeAction";
import * as fs from "fs";

@Authorized()
@JsonController("/location")
export class locationController {
  constructor(public locationRepository: LocationRepository) {
    this.locationRepository = new LocationRepository();
  }

  // for admin   (add location)
  @UseBefore(authorizeAction("location", "create"))
  @Post("/")
  async store(@Body() body: any) {
    try {
      let { address, latitude, longitude } = body;

      console.log("car location..", body);

      address = typeof address === "string" && address ? address : "";
      latitude = typeof latitude === "string" && latitude ? latitude : "";
      longitude = typeof longitude === "string" && longitude ? longitude : "";

      if (address && latitude && longitude) {
        const Location = {
          address,
          latitude,
          longitude
        };

        const result = await this.locationRepository.store(Location);

        return {
          success: true,
          message: "Location added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Address,latitude & longitude are required"
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

  @UseBefore(authorizeAction("location", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.locationRepository.findOne({ address: id });
        if (result) {
          return {
            success: true,
            message: "locations",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find any location for this id",
            data: null
          };
        }
      } else {
        return { success: true, message: "location id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  // for admin   (edit location API)
  @UseBefore(authorizeAction("location", "update"))
  @Put("/:id")
  async update(@Param("id") id: string, @Body() body: any) {
    try {
      let { address, latitude, longitude } = body;

      //console.log("Location Update REQUESTs..", body);
      address = typeof address === "string" && address ? address : "";
      latitude = typeof latitude === "string" && latitude ? latitude : "";
      longitude = typeof longitude === "string" && longitude ? longitude : "";

      if (id) {
        const result = await this.locationRepository.update({ id }, body);

        return {
          success: true,
          message: "location updated successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "location id is requred"
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

  @UseBefore(authorizeAction("location", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.locationRepository.softDelete(ids);
      return {
        success: true,
        message: "location deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("location", "read"))
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.locationRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "locations",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
