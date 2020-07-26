import * as mongoose from "mongoose";
import { rejects } from "assert";

export class RoleRepository {
  private collection = "role";
  private model: any;
  private defaultSearchColumn = "name";

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  /**
   * Store role to DB
   * @param data Object with role details
   */
  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const Role = new this.model(data);
        const role = await Role.save();
        return resolve(JSON.parse(JSON.stringify(role)));
      } catch (e) {
        // console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Update role in DB
   * @param data Object with role details
   */
  async update(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data["id"] && data["name"] && data["permissions"]) {
          const query = { _id: mongoose.Types.ObjectId(data["id"]) };
          const update = {
            $set: { name: data["name"], permissions: data["permissions"] }
          };

          const role = await this.model.findOneAndUpdate(query, update, {
            new: true
          });
          resolve(role);
        } else {
          return resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find role by ID
   * @param id Role object id
   */
  findOne(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const role = await this.model.findById(id).exec();
        if (role) {
          return resolve(JSON.parse(JSON.stringify(role)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Get all roles paginated
   * @param params Query params
   */
  findAllPaginated(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt_descend",
          searchColumn = this.defaultSearchColumn,
          searchKey = ""
        } = params;
        let query = { isDeleted: false };
        if (searchColumn && searchKey) {
          query[searchColumn] = {
            $regex: ".*" + searchKey + ".*",
            $options: "i"
          };
        }
        sorter = sorter.split("_").length >= 1 ? sorter : "createdAt_descend";
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        const sort = {
          [sorter.split("_")[0]]: sorter.split("_")[1] === "descend" ? -1 : 1
        };

        let list = await this.model
          .find(query, { name: 1, isDeleted: 1, createdAt: 1, updatedAt: 1 })
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort(sort)
          .exec();
        list = JSON.parse(JSON.stringify(list));
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();
        const pagination = {
          current: currentPage,
          pageSize: pageSize,
          total
        };
        return resolve({ list, pagination });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Check permission for perticular role->module->action
   * @param role Role for which permissions to be found
   * @param module Module for which permission needs to be checked
   * @param actions Action for which permission is required
   */
  async chekPermissions(role: string, module: string, action: String) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = {};
        // For which role
        query["name"] = role;
        query["permissions.name"] = module;
        // Moule and actions
        query[`permissions.actions`] = { $exists: true, $in: [action] };
        mongoose.set("debug", true);
        // mongoose.set("debug", true);
        const result = await this.model
          .aggregate([
            { $unwind: "$permissions" },
            { $match: query },
            { $count: "permissions" }
          ])
          .exec();
        resolve(result && result[0] && result[0].permissions > 0);
        // resolve(permissions > 0);
      } catch (e) {
        console.log("Error while checking permission", e);
        reject(false);
      }
    });
  }

  async modulePermisssions() {
    return new Promise(async (resolve, reject) => {
      try {
        const modulesPermissions = await this.model.aggregate([
          { $unwind: "$permissions" },
          {
            $match: {
              "permissions.actions": {
                $exists: true,
                $not: { $size: 0 },
                $in: ["read"]
              }
            }
          },
          { $group: { _id: "$permissions.name", roles: { $push: "$name" } } }
        ]);
        resolve(JSON.parse(JSON.stringify(modulesPermissions)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Soft delete or restore the document
   * @param ids Array of Document ids
   * @param deleteRecord Set to true to delete and false to restore
   */
  softDelete(ids, deleteRecord = true) {
    return new Promise(async (resolve, reject) => {
      try {
        let docids = ids.map(id => {
          return mongoose.Types.ObjectId(id);
        });
        const result = await this.model.updateMany(
          { _id: { $in: docids } },
          { $set: { isDeleted: deleteRecord } }
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }
}
