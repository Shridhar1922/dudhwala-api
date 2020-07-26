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
  import { categoryRepository } from "../repositories/categoryRepository";
  import { authorizeAction } from "../middlewares/authorizeAction";
  import * as fs from "fs";
  
  @Authorized()
  @JsonController("/category")
  export class ProductTypeController {
    constructor(public CategoryRepository: categoryRepository) {
      this.CategoryRepository = new categoryRepository();
    }
  
    // for admin   (add category)
    @UseBefore(authorizeAction("category", "create"))
    @Post("/")
    async store(@Body() body: any, @Req() req: any) {
      try {
        let { category, description ,productType } = body;
        //console.log(" product type..", body);
        category = typeof category === "string" && category ? category : "";
        description =
          typeof description === "string" && description ? description : "";
          if (typeof productType === "string") {
            productType = productType.split(", ");
          }
          productType = typeof productType === "object" && productType ? productType : "";
  
        if (category) {
          const categoryData = {
            category,
            description,
            productType
          };

          const result = await this.CategoryRepository.store(categoryData);
  
          return {
            success: true,
            message: "Category added successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "category is requred"
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
  
    @UseBefore(authorizeAction("category", "read"))
    @Get("/:id")
    async get(@Param("id") id: string, @Res() res: any) {
      try {
        if (id) {
          //console.log("IDdddd",id)
          const result = await this.CategoryRepository.findOne({
            categoryId: id
          });
          if (result) {
            return {
              success: true,
              message: "Categories",
              data: result
            };
          } else {
            return {
              success: false,
              message: "Could not find category for this id",
              data: null
            };
          }
        } else {
          return { success: true, message: "category id is requred" };
        }
      } catch (e) {
        console.log("ERROR", e.message);
        return { success: false, message: "Something went wrong", data: null };
      }
    }
  
    @UseBefore(authorizeAction("category", "update"))
    @Delete("/")
    async delete(@Body() body: any, @Res() res: any) {
      try {
        let { ids } = body;
        ids =
          ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
        const result = await this.CategoryRepository.softDelete(ids);
        return {
          success: true,
          message: "Category deleted successfully",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("category", "read"))
    @Get("/")
    async getAll(@QueryParams() params: any, @Res() res: any) {
      try {
        //console.log("get all categories...");
        let { pageSize, currentPage } = params;
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;
        const result = await this.CategoryRepository.findAllPaginated(
          Object.assign({}, params)
        );
        //console.log("RSULTS ", result);
        return {
          success: true,
          message: "Categories",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("category", "update"))
    @Put("/:id") // for admin   (edit category API)
    async update(
      @Param("id") id: string,
      @Body() body: any,
      @Res() res: any,
      @Req() req: any
    ) {
      try {
        let { category, description,productType} = body;
  
        category = typeof category === "string" && category ? category : "";
        description =
          typeof description === "string" && description ? description : "";
          //productType = typeof productType === "object" && productType ? productType : "";
          productType = typeof productType === "string" && productType ? productType : "";
  
        let update = {
          category,
          description,
          productType
        };

        const result = await this.CategoryRepository.update({ id }, update);
        return {
          success: true,
          message: "Category  Updated successfully",
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
  