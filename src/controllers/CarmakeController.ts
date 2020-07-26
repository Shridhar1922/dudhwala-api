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
import { carMakeRepository } from "../repositories/carmakeRepository";
import { authorizeAction } from "../middlewares/authorizeAction";
import * as fs from "fs";
import * as multer from "multer";

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const dest = `uploads/${file.fieldname}/`;
    try {
      if (!fs.existsSync(`public/${dest}`)) {
        fs.mkdirSync(`public/${dest}`);
      }

      callback(null, `public/${dest}`);
    } catch (e) {
      console.log(e.message);
    }
  },
  filename: function(req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + file.originalname.replace(" ", "_")
    );
  }
});

const upload = multer({ storage });

@Authorized()
@JsonController("/carmake")
export class CarMakeController {
  constructor(public carmakeRepository: carMakeRepository) {
    this.carmakeRepository = new carMakeRepository();
  }

  // for admin   (add car Make)
  @UseBefore(authorizeAction("carMake", "create"))
  @UseBefore(upload.fields([{ name: "logo" }]))
  @Post("/")
  async store(@Body() body: any, @Req() req: any) {
    try {
      let { name, description, logo } = body;

      console.log("car make..", body);

      name = typeof name === "string" && name ? name : "";
      description =
        typeof description === "string" && description ? description : "";

      if (name) {
        const carMake = {
          name,
          description
        };

        const logo = req && req.files ? req.files["logo"] : "";

        if (logo) {
          const paths = logo.map(logo => {
            const split = logo.path.split("public/");
            if (split && split[1]) {
              return { path: split[1] };
            }
          });
          if (paths) {
            carMake["logo"] = paths[0].path;
          }
        } else {
          return {
            success: false,
            message: "Car maker logo are required"
          };
        }

        const result = await this.carmakeRepository.store(carMake);

        return {
          success: true,
          message: "Car manufacturer added successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "Car manufacturer is requred"
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

  @UseBefore(authorizeAction("carMake", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.carmakeRepository.findOne({
          carMake: id
        });
        if (result) {
          return {
            success: true,
            message: "Car Make",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not car maker for this id",
            data: null
          };
        }
      } else {
        return { success: true, message: "car make id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("carMake", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.carmakeRepository.softDelete(ids);
      return {
        success: true,
        message: "Car Make deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("carMake", "read"))
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
      const result = await this.carmakeRepository.findAllPaginated(
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
  @UseBefore(upload.fields([{ name: "logo", maxCount: 1 }]))
  @Put("/:id") // for admin   (edit carMake API)
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @Req() req: any
  ) {
    try {
      let { name, description, logo } = body;

      name = typeof name === "string" && name ? name : "";
      description =
        typeof description === "string" && description ? description : "";

      let update = {
        name,
        description
      };

      logo = req && req.files ? req.files["logo"] : "";

      if (logo) {
        const paths = logo.map(logo => {
          const split = logo.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });

        //console.log("paths", paths);

        if (paths) {
          update["logo"] = paths[0].path;
        }
      }

      console.log("UPDATE CAR MAKE", update);
      const result = await this.carmakeRepository.update({ id }, update);
      return {
        success: true,
        message: "Car Make Updated successfully",
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

  @UseBefore(authorizeAction("carMake", "update"))
  @Put("/deleteLogo/:id")
  async logoimg(@Param("id") id: string, @Body() body: any, @Res() res: any) {
    try {
      const data = await this.carmakeRepository.findOne({
        carMake: id
      });

      let { keyName, path } = body;

      let update;

      if (keyName === "logo") {
        update = {
          $set: { logo: "" }
        };
      }
      fs.unlink("./public/" + path, err => {
        if (err) {
          console.error(err);
          return;
        } else {
          console.log("path", path);
        }
      });

      const result = await this.carmakeRepository.updateImages({ id }, update);
      {
        if (result) {
          return {
            success: true,
            message: "Car Make Logo deleted successfully"
            //data: result
          };
        } else {
          return {
            success: false,
            message: "Could not delete logo image",
            data: data
          };
        }
      }
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
