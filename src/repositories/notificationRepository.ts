import * as mongoose from "mongoose";
const logger = require("../libs/logger").createLogger("membership.log");

export class NotificationRepository {
  private collection = "notification";
  private model: any;
  private defaultSearchColumn = "notification";

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  query = {
    isDeleted: false
  };

  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const Notification = new this.model(data);
        console.log("notification added", Notification);
        const notificationData = await Notification.save();
        console.log("notification stored", notificationData);
        const notification = JSON.parse(JSON.stringify(notificationData));

        resolve(notification);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  findAll(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let { query } = params;
        query =
          query && typeof query === "object" && query instanceof Object
            ? query
            : {};
        // console.log("q", query);
        let list = await this.model
          .find(query)
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

  async update(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }
        let update = {};

        update["$set"] = data;
        const carfeature = await this.model.findOneAndUpdate(
          condition,
          update,
          {
            new: true
          }
        );

        resolve(JSON.parse(JSON.stringify(carfeature)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findUnreadNotificationCount(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let list = await this.model
          .find({
            isDeleted: false,
            read: false
          })
          .sort({ updatedAt: -1 })
          .exec();
        list = JSON.parse(JSON.stringify(list));
        return resolve(list.length);
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  //   Get notifications with pagination      /**
  //  * Get all users paginated
  //  * @param params Query params
  //  */
  // findAllPaginated(params) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let {
  //         currentPage = 1,
  //         pageSize = 12,
  //         sorter = "updatedAt",
  //         userType
  //       } = params;
  //       let query = { isDeleted: false };

  //       if (userType) {
  //         query["userType"] = userType;
  //       }
  //       sorter = sorter.split("_").length >= 1 ? sorter : "createdAt_descend";
  //       pageSize =
  //         pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
  //       const sort = {
  //         [sorter.split("_")[0]]: sorter.split("_")[1] === "descend" ? -1 : 1
  //       };
  //       // , { isDeleted: 0, password: 0 }
  //       let list = await this.model
  //         .find(query)
  //         .skip((currentPage - 1) * pageSize)
  //         .limit(pageSize)
  //         .sort({ updatedAt: -1 })
  //         .exec();
  //       list = JSON.parse(JSON.stringify(list));
  //       //const total = await this.model
  //       //.countDocuments({ isDeleted: false })
  //       //.exec();
  //       const pagination = {
  //         current: currentPage,
  //         pageSize: pageSize,
  //         total: list.length
  //       };
  //       return resolve({ list, pagination });
  //     } catch (e) {
  //       console.log("Notificaton ERROR", e.message);
  //       reject(e);
  //     }
  //   });
  // }
}
