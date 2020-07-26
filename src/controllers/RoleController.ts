import {
  Post,
  Get,
  Put,
  Delete,
  JsonController,
  Authorized,
  Body,
  Req,
  Res,
  UseBefore,
  Patch,
  Param,
  QueryParams
} from "routing-controllers";
import { RoleRepository } from "../repositories/roleRepository";
import { authorizeAction } from "../middlewares/authorizeAction";

@Authorized()
@JsonController("/role")
export class RoleController {
  private model: any;
  private collection = "role";
  constructor(public roleRepository: RoleRepository) {
    this.roleRepository = new RoleRepository();
  }

  @UseBefore(authorizeAction("role", "create"))
  @Post("/")
  async store(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      let { name, permissions } = body;
      name = name && typeof name === "string" ? name : "";
      permissions =
        typeof permissions === "object" && permissions instanceof Array
          ? permissions
          : {};
      if (name && permissions) {
        const result = await this.roleRepository.store({ name, permissions });

        return {
          success: true,
          message: "Role stored successfully",
          data: result
        };
      } else {
        return {
          success: false,
          message: "name and permissions are requred"
        };
      }
    } catch (err) {
      console.log("eoror", err);
      if (err.name === "MongoError" && err.code === 11000) {
        return {
          success: false,
          message: "Name already exist",
          data: null
        };
      }
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  @Get("/modulePermissions")
  async modulePermissions() {
    try {
      const modulePermissions = await this.roleRepository.modulePermisssions();
      return {
        success: true,
        message: "Modules permissions fetched",
        data: modulePermissions
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
        data: null
      };
    }
  }

  @UseBefore(authorizeAction("role", "update"))
  @Put("/:id")
  async update(@Param("id") id: string, @Body() body: any, @Res() res: any) {
    try {
      let { name, permissions } = body;
      name = name && typeof name === "string" ? name : "";
      permissions =
        typeof permissions === "object" && permissions instanceof Object
          ? permissions
          : {};
      if (name && permissions) {
        const result = await this.roleRepository.update({
          name,
          permissions,
          id
        });
        if (result) {
          return {
            success: true,
            message: "Role stored successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not update",
            data: null
          };
        }
      } else {
        return { success: true, message: "name and permissions are requred" };
      }
    } catch (e) {
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("role", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        const result = await this.roleRepository.findOne(id);
        if (result) {
          return {
            success: true,
            message: "Role fetched",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find role",
            data: null
          };
        }
      } else {
        return { success: true, message: "name and permissions are requred" };
      }
    } catch (e) {
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("role", "read"))
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
      const result = await this.roleRepository.findAllPaginated(
        Object.assign({}, params, { pageSize, currentPage })
      );
      return {
        success: true,
        message: "Roles fetched",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("role", "delete"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.roleRepository.softDelete(ids);
      return {
        success: true,
        message: "Roles moved to trash",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("role", "delete"))
  @Patch("/restore")
  async restore(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];

      const result = await this.roleRepository.softDelete(ids, false);
      return {
        success: true,
        message: "Roles restored",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
