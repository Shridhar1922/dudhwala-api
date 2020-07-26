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
  import { productRepository } from "../repositories/productRepository";
  import { authorizeAction } from "../middlewares/authorizeAction";
  import * as fs from "fs";
  
  @Authorized()
  @JsonController("/product")
  export class ProductTypeController {
    constructor(public ProductRepository: productRepository) {
      this.ProductRepository = new productRepository();
    }
  
    // for admin   (add product)
    @UseBefore(authorizeAction("product", "create"))
    @Post("/")
    async store(@Body() body: any, @Req() req: any) {
      try {
        let { name, description ,productType,category,subcategory,price,FAT,supplier} = body;
        //console.log("subcategory..", body);
        name = typeof name === "string" && name ? name : "";
        description =
          typeof description === "string" && description ? description : "";

          price = typeof price === "number" && price ? price : "";
          FAT = typeof FAT === "number" && FAT ? FAT : "";

          if (typeof productType === "string") {
            productType = productType.split(", ");
          }
          productType = typeof productType === "object" && productType ? productType : "";

          if (typeof supplier === "string") {
            supplier = supplier.split(", ");
          }
          supplier = typeof supplier === "object" && supplier ? supplier : "";

          

          if (typeof category === "string") {
            category = category.split(", ");
          }
          category = typeof category === "object" && category ? category : "";

          if (typeof subcategory === "string") {
            subcategory = subcategory.split(", ");
          }
          subcategory = typeof subcategory === "object" && subcategory ? subcategory : "";
  
        if (name) {
          const product = {
            name,
            description,
            productType,
            supplier,
            category,
            subcategory,
            price,
            FAT
          };

          const result = await this.ProductRepository.store(product);
  
          return {
            success: true,
            message: "Product added successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Product is requred"
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
  
    @UseBefore(authorizeAction("product", "read"))
    @Get("/:id")
    async get(@Param("id") id: string, @Res() res: any) {
      try {
        if (id) {
          //console.log("IDdddd",id)
          const result = await this.ProductRepository.findOne({
            productId: id
          });
          if (result) {
            return {
              success: true,
              message: "products",
              data: result
            };
          } else {
            return {
              success: false,
              message: "Could not find product for this id",
              data: null
            };
          }
        } else {
          return { success: true, message: "product id is requred" };
        }
      } catch (e) {
        console.log("ERROR", e.message);
        return { success: false, message: "Something went wrong", data: null };
      }
    }
  
    @UseBefore(authorizeAction("product", "update"))
    @Delete("/")
    async delete(@Body() body: any, @Res() res: any) {
      try {
        let { ids } = body;
        ids =
          ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
        const result = await this.ProductRepository.softDelete(ids);
        return {
          success: true,
          message: "Product deleted successfully",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("product", "read"))
    @Get("/")
    async getAll(@QueryParams() params: any, @Res() res: any) {
      try {
        //console.log("get all products...");
        let { pageSize, currentPage } = params;
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;
        const result = await this.ProductRepository.findAllPaginated(
          Object.assign({}, params)
        );
        //console.log("RSULTS ", result);
        return {
          success: true,
          message: "Products",
          data: result
        };
      } catch (e) {
        console.log("Error", e);
        return { success: false, message: e.message, data: null };
      }
    }
  
    @UseBefore(authorizeAction("product", "update"))
    @Put("/:id") // for admin   (edit product API)
    async update(
      @Param("id") id: string,
      @Body() body: any,
      @Res() res: any,
      @Req() req: any
    ) {
      try {
        let { name, description,productType,category,subCategory,price,FAT,supplier} = body;
  
        name = typeof name === "string" && name ? name : "";
        description =
          typeof description === "string" && description ? description : "";
          price = typeof price === "number" && price ? price : "";
          FAT = typeof FAT === "number" && FAT ? FAT : "";
          //productType = typeof productType === "object" && productType ? productType : "";
          productType = typeof productType === "string" && productType ? productType : "";
          supplier = typeof supplier === "string" && supplier ? supplier : "";
          category = typeof category === "string" && category ? category : "";
          subCategory = typeof subCategory === "string" && subCategory ? subCategory : "";
  
  
        let update = {
          name,
          description,
          productType,
          supplier,
          category,
          subCategory,
          price,
          FAT
        };

        const result = await this.ProductRepository.update({ id }, update);
        return {
          success: true,
          message: "Product Updated successfully",
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
  