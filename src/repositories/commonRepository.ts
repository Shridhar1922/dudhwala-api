import * as mongoose from "mongoose";
import { rejects } from "assert";

export class CommonRepository {
  private allowedUpdateCollections = ["attribute", "attributeType"];
  constructor() {}

  /**
   * Get all roles paginated
   * @param params Query params
   */
  findAll(params) {
    return new Promise(async (resolve, reject) => {
      try {
        mongoose.set("debug", true);
        let { model, query, projection } = params;
        query =
          query && typeof query === "object" && query instanceof Object
            ? query
            : {};
        projection =
          projection &&
          typeof projection === "object" &&
          projection instanceof Object
            ? projection
            : {};
        if (!model) {
          console.log("Model is invalid");
          return reject("model is invalid");
        }
        // console.log("q", query);
        let list = await mongoose
          .model(model)
          .find(query, projection)
          .populate("make")
          .sort({ createdAt: -1 })
          .exec();
        list = JSON.parse(JSON.stringify(list));
        return resolve(list);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  findCarModel(params) {
    return new Promise(async (resolve, reject) => {
      try {
        mongoose.set("debug", true);
        let { model, query } = params;
        // query =
        //   query && typeof query === "object" && query instanceof Object
        //     ? query
        //     : {};
        //let makepopulate = query["make"];
        if (!model) {
          console.log("Model is invalid");
          return reject("model is invalid");
        }
        console.log("q", query);
        let list = await mongoose
          .model(model)
          .find(query)
          .exec();
        list = JSON.parse(JSON.stringify(list));
        return resolve(list);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Get all roles paginated
   * @param params Query params
   */
  // findByCarmakeID(params) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       mongoose.set("debug", true);
  //       let { model, query, projection } = params;
  //       query =
  //         query && typeof query === "object" && query instanceof Object
  //           ? query
  //           : {};
  //       projection =
  //         projection &&
  //         typeof projection === "object" &&
  //         projection instanceof Object
  //           ? projection
  //           : {};
  //       if (!model) {
  //         console.log("Model is invalid");
  //         return reject("model is invalid");
  //       }
  //       // console.log("q", query);
  //       let list = await mongoose
  //         .model(model)
  //         .find(query, projection)
  //         .sort({ createdAt: -1 })
  //         .exec();
  //       list = JSON.parse(JSON.stringify(list));
  //       return resolve(list);
  //     } catch (e) {
  //       console.log("Error", e);
  //       reject(e);
  //     }
  //   });
  // }

  /**
   * Get all roles paginated
   * @param params Query params
   */
  findOneByQuery(params) {
    return new Promise(async (resolve, reject) => {
      try {
        mongoose.set("debug", true);
        let { model, query, projection } = params;
        query =
          query && typeof query === "object" && query instanceof Object
            ? query
            : {};
        projection =
          projection &&
          typeof projection === "object" &&
          projection instanceof Object
            ? projection
            : {};
        if (!model) {
          console.log("Model is invalid");
          return reject("model is invalid");
        }
        // console.log("q", query);
        let list = await mongoose
          .model(model)
          .findOne(query, projection)
          .sort({ createdAt: -1 })
          .exec();
        list = JSON.parse(JSON.stringify(list));
        return resolve(list);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Get all distinct values paginated
   * @param model Model name
   * @param key Key for distinct
   */
  findAllDistict(model: string, key: string) {
    return new Promise(async (resolve, reject) => {
      try {
        mongoose.set("debug", true);
        if (!model) {
          console.log("Model is invalid");
          return reject("model is invalid");
        }
        // console.log("q", query);
        let list = await mongoose
          .model(model)
          .find()
          .distinct(key)
          .exec();
        list = JSON.parse(JSON.stringify(list));
        return resolve(list);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Store record to collections
   * @param type String for type of collection values : country | state | city
   * @param data Object with location details
   */
  async store(type: string, data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const model = mongoose.model(type);
        const CommonModel = new model(data);
        const record = await CommonModel.save();
        return resolve(JSON.parse(JSON.stringify(record)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Update location in collections
   * @param type String for type of collection values : country | state | city
   * @param data Object with location details
   */
  async update(type: string, condition: Object, data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(
          "type",
          type,
          this.allowedUpdateCollections,
          this.allowedUpdateCollections.indexOf(type)
        );
        if (this.allowedUpdateCollections.indexOf(type) < 0) {
          reject("Cannot update " + type);
          return;
        }
        const model = mongoose.model(type);
        if (condition["_id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["_id"]);
          // delete condition["_id"];
        }
        // let update = data;
        const location = await model.findOneAndUpdate(condition, data, {
          new: true
        });
        resolve(JSON.parse(JSON.stringify(location)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find location by ID
   * @param type String for type of collection values : country | state | city
   * @param id Location object id
   */
  findOne(type: String, id, populate = "") {
    return new Promise(async (resolve, reject) => {
      try {
        // console.log("ftuydweaghjfjk", type);
        // console.log("id.......", id);
        // console.log("populate.......", populate);

        const model = mongoose.model(type);
        const record = await model
          .findById({ make: id })
          .populate(populate)
          .exec();
        if (record) {
          return resolve(JSON.parse(JSON.stringify(record)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  // find({ type: String, id }) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const model = mongoose.model(type);
  //       const record = await model.find({ make: id, isDeleted: false }).exec();
  //       console.log("carRecord", model);
  //       if (model) {
  //         return resolve(JSON.parse(JSON.stringify(model)));
  //       } else {
  //         resolve(false);
  //       }
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

  /**
   * Find location by ID
   * @param type String for type of collection values : country | state | city
   * @param id Location object id
   */
  findOneWithSubDocuments(type: String, id, subdocument) {
    return new Promise(async (resolve, reject) => {
      try {
        const model = mongoose.model(type);
        const record = await model
          .findById(id)
          .populate(subdocument)
          .exec();
        if (record) {
          return resolve(JSON.parse(JSON.stringify(record)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Get all records paginated
   * @param type String for type of collection values : country | state | city
   * @param params Query params
   */
  findAllPaginated(type: String, params) {
    return new Promise(async (resolve, reject) => {
      try {
        const model = mongoose.model(type);
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "name_ascending",
          searchKey = "",
          query,
          projection
        } = params;
        query =
          query && typeof query === "object" && query instanceof Object
            ? query
            : {};
        projection =
          projection &&
          typeof projection === "object" &&
          projection instanceof Object
            ? projection
            : {};
        if (searchKey) {
          query["name"] = {
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
        let list = await model

          .find({ ...query, isDeleted: false })
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort(sort)
          .exec();
        list = JSON.parse(JSON.stringify(list));
        const total = await model
          .countDocuments({ ...query, isDeleted: false })
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
   * Soft delete or restore the document
   * @param type String for type of collection values : country | state | city
   * @param ids Array of Document ids
   * @param type String for type of collection values : country | state | city
   * @param deleteRecord Set to true to delete and false to restore
   */
  softDelete(type: String, ids, deleteRecord = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const model = mongoose.model(type);
        let docids = ids.map(id => {
          return mongoose.Types.ObjectId(id);
        });
        const result = await model.updateMany(
          { _id: { $in: docids } },
          { $set: { isDeleted: deleteRecord } }
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  findAllPag(params) {
    return new Promise(async (resolve, reject) => {
      try {
        //mongoose.set("debug", true);

        console.log("params..", params);
        let q = params.query;

        let cp = params.params.currentPage;

        let ps = params.params.pageSize;

        // let {
        //   currentPage = 1,
        //   pageSize = 12,
        //   sorter = "updatedAt",
        //   searchKey = ""
        // } = params;

        ps = ps && !isNaN(parseInt(ps)) ? parseInt(ps) : 12;
        cp = cp && !isNaN(parseInt(cp)) ? parseInt(cp) : 1;

        let { model, query, projection } = params;
        // query =
        //   query && typeof query === "object" && query instanceof Object
        //     ? query
        //     : {};
        // projection =
        //   projection &&
        //   typeof projection === "object" &&
        //   projection instanceof Object
        //     ? projection
        //     : {};
        if (!model) {
          console.log("Model is invalid");
          return reject("model is invalid");
        }
        console.log("q", query);
        let list = await mongoose
          .model(model)
          .find(query)
          .skip((cp - 1) * ps)
          .limit(ps)
          .populate("make")
          .sort({ updatedAt: -1 })
          .exec();

        list = JSON.parse(JSON.stringify(list));
        return resolve(list);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }
}
