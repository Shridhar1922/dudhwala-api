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
  import { subcategoryRepository } from "../repositories/subcategoryRepository";
  import { authorizeAction } from "../middlewares/authorizeAction";
  import * as fs from "fs";
  
  @Authorized()
  @JsonController("/subcategory")
  export class ProductTypeController {
    constructor(public SubcategoryRepository: subcategoryRepository) {
      this.SubcategoryRepository = new subcategoryRepository();
    }
  
    // for admin   (add sub category)
    @UseBefore(authorizeAction("subcategory", "create"))
    @Post("/")
    async store(@Body() body: any, @Req() req: any) {
      try {
        let { subCategory, description ,productType,category } = body;
        //console.log("subcategory..", body);
        subCategory = typeof subCategory === "string" && subCategory ? subCategory : "";
        description =
          typeof description === "string" && description ? description : "";

          if (typeof productType === "string") {
            productType = productType.split(", ");
          }
          productType = typeof productType === "object" && productType ? productType : "";

          if (typeof category === "string") {
            category = category.split(", ");
          }
          category = typeof category === "object" && category ? category : "";
  
        if (subCategory) {
          const subcategory = {
            subCategory,
            description,
            productType,
            category
          };

          const result = await this.SubcategoryRepository.store(subcategory);
  
          return {
            success: true,
            message: "subCategory added successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "subCategory is requred"
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
  
    @UseBefore(authorizeAction("subcategory", "read"))
    @Get("/:id")
    async get(@Param("id") id: string, @Res() res: any) {
      try {
        if (id) {
          //console.log("IDdddd",id)
          const result = await this.SubcategoryRepository.findOne({
            subcategoryId: id
          });
          if (result) {
            return {
              success: true,
              message: "Sub Categories",
              data: result
            };
          } else {
            return {
              success: false,
              message: "Could not find subcategory for this id",
              data: null
            };
          }
        } else {
          return { success: true, message: "subcategory id is requred" };
        }
      } catch (e) {
        console.log("ERROR", e.message);
        return { success: false, message: "Something went wrong", data: null };
      }
    }
  
    @UseBefore(authorizeAction("subcategory", "update"))
    @Delete("/")
    async delete(@Body() body: any, @Res() res: any) {
      try {
        let { ids } = body;
        ids =
          ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
        const result = await this.SubcategoryRepository.softDelete(ids);
        return {
          success: true,
          message: "subCategory deleted successfully",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("subcategory", "read"))
    @Get("/")
    async getAll(@QueryParams() params: any, @Res() res: any) {
      try {
        //console.log("get all subcategories...");
        let { pageSize, currentPage } = params;
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;
        const result = await this.SubcategoryRepository.findAllPaginated(
          Object.assign({}, params)
        );
        //console.log("RSULTS ", result);
        return {
          success: true,
          message: "Sub Categories",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("subcategory", "update"))
    @Put("/:id") // for admin   (edit subcategory API)
    async update(
      @Param("id") id: string,
      @Body() body: any,
      @Res() res: any,
      @Req() req: any
    ) {
      try {
        let { subCategory, description,productType,category} = body;
  
        subCategory = typeof subCategory === "string" && subCategory ? subCategory : "";
        description =
          typeof description === "string" && description ? description : "";
          //productType = typeof productType === "object" && productType ? productType : "";
          productType = typeof productType === "string" && productType ? productType : "";
          category = typeof category === "string" && category ? category : "";
  
        let update = {
          subCategory,
          description,
          productType,
          category
        };

        const result = await this.SubcategoryRepository.update({ id }, update);
        return {
          success: true,
          message: "subCategory  Updated successfully",
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
  