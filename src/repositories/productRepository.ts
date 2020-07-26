import * as mongoose from "mongoose";

export class productRepository {
  private collection = "product";
  private model: any;
  private defaultSearchColumn = "name";

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  query = {
    isDeleted: false
  };

  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const product = new this.model(data);
        console.log("sub category", product);
        const productDate = await product.save();
        console.log("stored", productDate);
        resolve(JSON.parse(JSON.stringify(productDate)));
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Get all products paginated
   * @param params Query params
   */
  findAllPaginated(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt_descend",
          searchKey = ""
        } = params;

        const query = {
          isDeleted: false
        };

        if (searchKey) {
          query["name"] = {
            $regex: `.*${searchKey}.*`,
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
          .find(query)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort(sort)
          .exec();
        list = JSON.parse(JSON.stringify(list));
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();
        const pagination = {
          currentPage,
          pageSize,
          total
        };
        return resolve({ list, pagination });
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Update product */

  async update(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }
        let update = {};

        update["$set"] = data;
        const carmake = await this.model.findOneAndUpdate(condition, update, {
          new: true
        });

        resolve(JSON.parse(JSON.stringify(carmake)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findOne({ productId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const productRecord = await this.model
          .findById(productId, this.query)
          .exec();
        if (productRecord) {
          return resolve(JSON.parse(JSON.stringify(productRecord)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  softDelete(ids, isDeleted = true) {
    return new Promise(async (resolve, reject) => {
      try {
        let docids = ids.map(id => {
          return mongoose.Types.ObjectId(id);
        });
        const result = await this.model.updateMany(
          { _id: { $in: docids } },
          { $set: { isDeleted: true } }
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }
}
