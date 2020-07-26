import {
  Get,
  JsonController,
  Authorized,
  Body,
  Req,
  Res,
  Post,
  Params,
  Param,
  Put,
  QueryParam,
  Delete,
  Patch,
  QueryParams
} from "routing-controllers";
import { CommonRepository } from "../repositories/commonRepository";

@JsonController("/common")
export class CommonController {
  private model: any;
  private collection = "common";
  constructor(public commonRepository: CommonRepository) {
    this.commonRepository = new CommonRepository();
  }


  @Get("/productType")
  async getproductType(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "productType",
        query: { isDeleted: false },
        projection: {}
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/category")
  async getcategory(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "category",
        query: { isDeleted: false },
        projection: {}
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/subcategory")
  async getsubcategory(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "subcategory",
        query: { isDeleted: false },
        projection: {}
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }


  @Get("/product")
  async getproduct(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "product",
        query: { isDeleted: false },
        projection: {}
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }


  @Get("/category/ByProductTypeID/:id")
  async getCategoryProductTypeID(
    @Param("id") id: string,
    @Req() req: any,
    @Res() res: any
  ) {
    try {
      //const { id } = params;
      const query = { isDeleted: false };
      if (id) {
        query["productType"] = id;
      }
      console.log("Query", query);

      const result = await this.commonRepository.findCarModel({
        model: "category",
        query
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/modules")
  async getModules(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "module",
        query: { isDeleted: false },
        projection: {}
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/carTypes")
  async getTailors(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "carType",
        query: { isDeleted: false },
        projection: { name: 1 }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/getCars?") // Approved  & Published
  async getApprovedCars(
    @Body() body: any,
    @Req() req: any,
    @QueryParams() params: any,
    @Res() res: any
  ) {
    try {
      let { carType, make, pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;

      const query = {
        isDeleted: false,
        status: "approved",
        isPublished: "published"
      };
      if (carType) {
        query["carType"] = carType;
      }
      if (make) {
        query["make"] = make;
      }

      const result = await this.commonRepository.findAllPag({
        model: "car",
        query,
        params
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Post("/getCarsByFilter") // Approved  & Published and with filter
  async getCarsByFilter(
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
    @QueryParams() params: any
  ) {
    try {
      let { pageSize, currentPage, carType, make } = body;
      console.log("getCarsByFilter Req", body);
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;

      const query = {
        isDeleted: false,
        status: "approved",
        isPublished: "published"
      };

      //console.log("111111111", carType.length);
      //console.log("222222222222", make.length);

      if (carType.length > 0) {
        //console.log("innnnnnnnnnnn")

        // query["isDeleted"] = false;
        // query["status"] = "approved";
        // query["isPublished"] = "published";
        query["carType"] = { $in: carType };
      } else if (make.length > 0) {
        // query["isDeleted"] = false;
        // query["status"] = "approved";
        // query["isPublished"] = "published";
        query["make"] = { $in: make };
      } else if (carType.length == 0 && make.length == 0) {
        console.log("Both Emptyyy..");

        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
      } else if (carType.length > 0 && make.length == 0) {
        //console.log("Only Type is given.....");

        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        query["carType"] = { $in: carType };
        //query["make"] = { $in: make };
      } else if (make.length > 0 && carType.length == 0) {
        //console.log("Only make is Given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        //query["carType"] = { $in: carType };
        query["make"] = { $in: make };
      } else if (make.length > 0 && carType.length > 0) {
        //console.log("Both given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        query["carType"] = { $in: carType };
        query["make"] = { $in: make };
      }

      // else{

      //   console.log("In else...")

      //   query["isDeleted"] = false;
      //   query["status"] = "approved";
      //   query["isPublished"] = "published";

      // }

      console.log("getCarsByFilter query", query);

      const result = await this.commonRepository.findAllPag({
        model: "car",
        query,
        params
      });
      return {
        success: true,
        message: "results found for this filter..!",
        data: result
      };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Post("/getCarsByFilterAndLocation?") // Approved & Published & location and with filter
  async getCarsByFilterAndLocation(
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
    @QueryParams() params: any
  ) {
    try {
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      let { carType, make, pickupLocations, dropoffLocations } = body;
      console.log("getCarsByFilterAndLocation Req", body);

      const query = {
        isDeleted: false,
        status: "approved",
        isPublished: "published"
        // pickupLocations: {
        //   $in: pickupLocations
        // },
        // dropoffLocations: {
        //   $in: dropoffLocations
        // }
      };

      //console.log("111111111", carType.length);
      //console.log("222222222222", make.length);

      if (carType.length > 0) {
        console.log("in 1");

        // query["isDeleted"] = false;
        // query["status"] = "approved";
        // query["isPublished"] = "published";
        query["carType"] = { $in: carType };
      } else if (make.length > 0) {
        console.log("in 2");
        // query["isDeleted"] = false;
        // query["status"] = "approved";
        // query["isPublished"] = "published";
        query["make"] = { $in: make };
      } else if (carType.length == 0 && make.length == 0) {
        console.log("All Emptyyy..");

        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
      } else if (carType.length > 0 && make.length == 0) {
        //console.log("Only Type is given.....");

        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        query["carType"] = { $in: carType };
        //query["make"] = { $in: make };
      } else if (make.length > 0 && carType.length == 0) {
        //console.log("Only make is Given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        //query["carType"] = { $in: carType };
        query["make"] = { $in: make };
      } else if (make.length > 0 && carType.length > 0) {
        //console.log("Both given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        query["carType"] = { $in: carType };
        query["make"] = { $in: make };
      } else if (pickupLocations.length > 0) {
        query["pickupLocations"] = { $in: pickupLocations };
      } else if (dropoffLocations.length > 0) {
        query["dropoffLocations"] = {
          $in: dropoffLocations
        };
      } else if (pickupLocations.length == 0 && dropoffLocations.length == 0) {
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
      } else if (pickupLocations.length > 0 && dropoffLocations.length == 0) {
        query["pickupLocations"] = { $in: pickupLocations };
        //query["make"] = { $in: make };
      } else if (dropoffLocations.length > 0 && pickupLocations.length == 0) {
        query["dropoffLocations"] = {
          $in: dropoffLocations
        };
      } else if (pickupLocations.length > 0 && dropoffLocations.length > 0) {
        //console.log("Both given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        query["pickupLocations"] = {
          $in: pickupLocations
        };
        query["dropoffLocations"] = {
          $in: dropoffLocations
        };
      } else if (
        carType.length > 0 &&
        make.length > 0 &&
        pickupLocations.length > 0 &&
        dropoffLocations.length > 0
      ) {
        //console.log("Both given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
        query["isPublished"] = "published";
        query["pickupLocations"] = {
          $in: pickupLocations
        };
        query["dropoffLocations"] = {
          $in: dropoffLocations
        };
        query["carType"] = { $in: carType };
        query["make"] = { $in: make };
      } else {
        //console.log("Both given....");
        query["isDeleted"] = false;
        query["status"] = "approved";
      }

      console.log("getCarsByFilter query", query);

      const result = await this.commonRepository.findAllPag({
        model: "car",
        query,
        params
      });
      return {
        success: true,
        message: "results found for this filter..!",
        data: result
      };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/suppliers")
  async getSuppliers(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "user",
        query: { isDeleted: false, userType: "supplier", status: "approved" }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/locations")
  async getLocations(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "location",
        query: { isDeleted: false }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/carFeatures")
  async carFeatures(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "carFeature",
        query: { isDeleted: false }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/carFeatures/filter")
  async getFeaturesbyFeatureType(
    @Body() body: any,
    @Req() req: any,
    @QueryParams() params: any,
    @Res() res: any
  ) {
    try {
      const { searchKey, featureType } = params;
      const query = { isDeleted: false };
      if (featureType) {
        query["featureType"] = featureType;
      }
      if (searchKey) {
        query["name"] = {
          $regex: ".*" + searchKey + ".*",
          $options: "i"
        };
      }
      const result = await this.commonRepository.findAll({
        model: "carFeature",
        query,
        projection: { name: 1 }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      console.log("Error occured at suggestion", e.message);
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/carmakes")
  async getcarMakes(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "carMake",
        query: { isDeleted: false },
        projection: { name: 1 }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  // @Get("carmodels/bycarmake/id")
  // async getCarModelByCarMakeId(@Param("id") id: string, @Res() res: any) {
  //   try {
  //     const result = await this.commonRepository.findByCarmakeID({
  //       model: "carModel",
  //       query: { isDeleted: false, make: id },
  //       projection: { name: 1 }
  //     });
  //     return { success: true, message: "success", data: result };
  //   } catch (e) {
  //     console.log("Error occured", e);
  //     return res
  //       .status(500)
  //       .send({ success: false, message: "Something went wrong", data: null });
  //   }
  // }

  @Authorized()
  @Get("/roles")
  async getRoles(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const result = await this.commonRepository.findAll({
        model: "role",
        query: { isDeleted: false },
        projection: { name: 1 }
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/carModel/ByMakeID/:id")
  async getCarModelslistBymakeid(
    @Param("id") id: string,
    @Req() req: any,
    @Res() res: any
  ) {
    try {
      //const { id } = params;
      const query = { isDeleted: false };
      if (id) {
        query["make"] = id;
      }
      console.log("Query", query);

      const result = await this.commonRepository.findCarModel({
        model: "carModel",
        query
      });
      return { success: true, message: "success", data: result };
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  @Get("/getCarByID/:id")
  async getCarByID(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //const { id } = params;
        const query = { isDeleted: false };
        if (id) {
          query["_id"] = id;
        }
        console.log("getCarByID Query", query);
        const result = await this.commonRepository.findCarModel({
          model: "car",
          query
        });
        if (result) {
          return {
            success: true,
            message: "Car details",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find car request for this car",
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
}
