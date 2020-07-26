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
  import { productTypeRepository } from "../repositories/producttypeRepository";
  import { authorizeAction } from "../middlewares/authorizeAction";
  import * as fs from "fs";
  
  @Authorized()
  @JsonController("/productType")
  export class ProductTypeController {
    constructor(public producttypeRepository: productTypeRepository) {
      this.producttypeRepository = new productTypeRepository();
    }
  
    // for admin   (add product Type)
    @UseBefore(authorizeAction("productType", "create"))
    @Post("/")
    async store(@Body() body: any, @Req() req: any) {
      try {
        let { productType, description } = body;
        //console.log(" product type..", body);
        productType = typeof productType === "string" && productType ? productType : "";
        description =
          typeof description === "string" && description ? description : "";
  
        if (productType) {
          const productTypeData = {
            productType,
            description
          };

          const result = await this.producttypeRepository.store(productTypeData);
  
          return {
            success: true,
            message: "Product Type added successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Product Type is requred"
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
  
    @UseBefore(authorizeAction("productType", "read"))
    @Get("/:id")
    async get(@Param("id") id: string, @Res() res: any) {
      try {
        if (id) {
          //console.log("IDdddd",id)
          const result = await this.producttypeRepository.findOne({
            productType: id
          });
          if (result) {
            return {
              success: true,
              message: "Product Type",
              data: result
            };
          } else {
            return {
              success: false,
              message: "Could not product type for this id",
              data: null
            };
          }
        } else {
          return { success: true, message: "product type id is requred" };
        }
      } catch (e) {
        console.log("ERROR", e.message);
        return { success: false, message: "Something went wrong", data: null };
      }
    }
  
    @UseBefore(authorizeAction("productType", "update"))
    @Delete("/")
    async delete(@Body() body: any, @Res() res: any) {
      try {
        let { ids } = body;
        ids =
          ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
        const result = await this.producttypeRepository.softDelete(ids);
        return {
          success: true,
          message: "Product type deleted successfully",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("productType", "read"))
    @Get("/")
    async getAll(@QueryParams() params: any, @Res() res: any) {
      try {
        console.log("get allproduct types...");
        let { pageSize, currentPage } = params;
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;
        const result = await this.producttypeRepository.findAllPaginated(
          Object.assign({}, params)
        );
        //console.log("RSULTS ", result);
        return {
          success: true,
          message: "Product Types",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("productType", "update"))
    @Put("/:id") // for admin   (edit producttype API)
    async update(
      @Param("id") id: string,
      @Body() body: any,
      @Res() res: any,
      @Req() req: any
    ) {
      try {
        let { productType, description} = body;
  
        productType = typeof productType === "string" && productType ? productType : "";
        description =
          typeof description === "string" && description ? description : "";
  
        let update = {
          productType,
          description
        };

        console.log("UPDATE product type", update);
        const result = await this.producttypeRepository.update({ id }, update);
        return {
          success: true,
          message: "Product Type Updated successfully",
          data: result
        };
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
  