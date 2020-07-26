import * as mongoose from "mongoose";

export class CarRepository {
  private collection = "car";
  private model: any;
  private defaultSearchColumn = "carName";

  constructor() {
    this.model = mongoose.model(this.collection);
  }
  query = {
    isDeleted: false
  };
  /**
   * Store car into DB
   * @param data Object with user details
   */
  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const CarDetails = new this.model(data);
        console.log("Car Details", CarDetails);
        const carData = await CarDetails.save();
        console.log("stored", carData);
        resolve(JSON.parse(JSON.stringify(carData)));
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Get all cars
   */
  findAll(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let { carName } = params;

        const query = {
          isDeleted: false
        };

        if (carName) {
          query["isDeleted"] = false;
        }
        let list = await this.model.find(query);

        list = JSON.parse(JSON.stringify(list));
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();
        // const pagination = {
        //   total
        // };
        return resolve({ list });
      } catch (e) {
        reject(e);
      }
    });
  }

  // findAllPaginated(params) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let {
  //         currentPage = 1,
  //         pageSize = 12,
  //         sorter = "updatedAt_descend",
  //         searchColumn = this.defaultSearchColumn,
  //         searchKey = "",
  //         carType
  //       } = params;
  //       let query = { isDeleted: false };

  //       if (searchColumn && searchKey) {
  //         query["$or"] = [
  //           {
  //             carName: {
  //               $regex: ".*" + searchKey + ".*",
  //               $options: "i"
  //             }
  //           }

  //         ];
  //       }
  //       if (carType) {
  //         query["carType"] = carType;
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
  //         .sort(sort)
  //         .exec();

  //         list = JSON.parse(JSON.stringify(list));
  //       const total = await this.model
  //         .countDocuments({ isDeleted: false })
  //         .exec();
  //       const pagination = {
  //         current: currentPage,
  //         pageSize: pageSize,
  //         total
  //       };
  //       return resolve({ list, pagination });
  //     } catch (e) {
  //       console.log("USER ERROR", e.message);
  //       reject(e);
  //     }
  //   });
  // }

  findAllPaginated(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt_descend",
          searchColumn = this.defaultSearchColumn,
          searchKey = "",
          carType
        } = params;
        let query = { isDeleted: false };

        if (searchKey) {
          query["companyName"] = {
            $regex: `.*${searchKey}.*`,
            $options: "i"
          };
        }
        if (carType) {
          query["carType"] = carType;
        }
        sorter = sorter.split("_").length >= 1 ? sorter : "createdAt_descend";
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        const sort = {
          [sorter.split("_")[0]]: sorter.split("_")[1] === "descend" ? -1 : 1
        };
        // , { isDeleted: 0, password: 0 }
        let list = await this.model
          .find(query)
          .populate("make")
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
        console.log("USER ERROR", e.message);
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

        if (data["images"]) {
          update["$push"] = { images: data["images"] };
          delete data["images"];
        }
        update["$set"] = data;

        const carUpdateRequest = await this.model.findOneAndUpdate(
          condition,
          update,
          {
            new: true
          }
        );
        resolve(JSON.parse(JSON.stringify(carUpdateRequest)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findOne({ car }) {
    return new Promise(async (resolve, reject) => {
      try {
        const carRecord = await this.model
          .findById(car, this.query)
          //.populate("make")
          .exec();
        if (carRecord) {
          return resolve(JSON.parse(JSON.stringify(carRecord)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findSupplierCars({ user, params }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          supplier: user._id
        };
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt",
          searchKey = ""
        } = params;

        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;

        const suppliercarRecord = await this.model
          .find(Query)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort({ updatedAt: -1 })
          .populate("make")
          .populate("features")
          .populate("pickupLocations")
          .populate("dropoffLocations");
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();

        //const list = JSON.parse(JSON.stringify(suppliercarRecord));

        if (suppliercarRecord) {
          return resolve(JSON.parse(JSON.stringify(suppliercarRecord)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findSupplierCarsbySupplierID({ id, params }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          supplier:id
        };
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt",
          searchKey = ""
        } = params;

        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;

        const suppliercarRecord = await this.model
          .find(Query)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort({ updatedAt: -1 })
          .populate("make")
          .populate("features")
          .populate("supplier")
          .populate("pickupLocations")
          .populate("dropoffLocations");
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();

        //const list = JSON.parse(JSON.stringify(suppliercarRecord));

        if (suppliercarRecord) {
          return resolve(JSON.parse(JSON.stringify(suppliercarRecord)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findApprovedCarscount({ supplier }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          supplier: supplier
          //status:"approved"
        };

        const suppliercarRecord = await this.model
          .find(Query)
          //.populate("supplier")
          .exec();
        if (suppliercarRecord) {
          return resolve(JSON.parse(JSON.stringify(suppliercarRecord)));
        } else {
          resolve(false);
        }
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

  findCarsCount() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {
          isDeleted: false
        };

        let list = await this.model.find(query).exec();
        //console.log("LIST",list)

        list = JSON.parse(JSON.stringify(list));
        const carsTotal = await this.model
          .countDocuments({ isDeleted: false })
          .exec();
        const jsObj = {
          cars: carsTotal
        };
        return resolve(jsObj);
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Verify car API for admin update query(Car Status: Verified) */
  async updateCarStatus(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }
        let update = {};

        update["$set"] = data;
        const supplier = await this.model.findOneAndUpdate(condition, update, {
          new: true
        });

        resolve(JSON.parse(JSON.stringify(supplier)));
      } catch (e) {
        reject(e);
      }
    });
  }

  async updateImages(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }

        // console.log("condition", condition);
        // console.log("data", data);
        //let update = {};
        //update["$set"] = data;

        const removeImageRequest = await this.model.findOneAndUpdate(
          condition,
          data
        );
        resolve(JSON.parse(JSON.stringify(removeImageRequest)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findCar(
    //car,
    //bookingOption,
    fromDate,
    toDate,
    // pickupLocation,
    // dropoffLocation
    dates
  ) {
    console.log("dates", dates);
    return new Promise(async resolve => {
      let query = {
        fromDate: { $nin: dates },
        toDate: { $nin: dates }
      };

      console.log("serach Car queryyyy", query);
      try {
        const AllData = await this.model
          //.find(query)
          .aggregate([
            {
              $lookup: {
                from: "bookings",
                localField: "_id",
                foreignField: "car",
                as: "bookings"
              },

              $match: {
                $or: [
                  { _id: [] },
                  {
                    $and: [
                      {
                        "cars.bookings.fromDate": {
                          $gte: fromDate,
                          $lte: toDate
                        }
                      },
                      {
                        "cars.bookings.toDate": {
                          $gte: fromDate,
                          $lte: toDate
                        }
                      },
                      {
                        "cars.bookings.fromDate": { $nin: dates }
                      },
                      { "cars.bookings.toDate": { $nin: dates } }
                    ]
                  }
                ]
              }
            }
          ])
          .exec();
        console.log("search car", AllData);
        if (!AllData) {
          resolve({});
        } else {
          resolve(JSON.parse(JSON.stringify(AllData)));
        }
      } catch (e) {
        console.log("Error fetching details...", e);
        resolve();
      }
    });
  }

  findAvailbleCars(uniqueBookedCars) {
    console.log(" findAvailbleCars", uniqueBookedCars);
    return new Promise(async resolve => {
      let query = {
        _id: { $nin: uniqueBookedCars }
      };

      //console.log("serach Car queryyyy", query);
      try {
        const AllAvailbleCarsData = await this.model
          .find(query)
          //.populate("car")
          .exec();
        //console.log("All Availble CarsData", AllAvailbleCarsData);
        if (!AllAvailbleCarsData) {
          resolve({});
        } else {
          resolve(JSON.parse(JSON.stringify(AllAvailbleCarsData)));
        }
      } catch (e) {
        console.log("Error fetching details...", e);
        resolve();
      }
    });
  }

  getCars(pickupLocations, dropoffLocations, params) {
    return new Promise(async resolve => {
      let query = {
        isDeleted: false,
        status: "approved",
        isPublished: "published",
        pickupLocations: {
          $in: pickupLocations
        },
        dropoffLocations: {
          $in: dropoffLocations
        }
      };

      let {
        currentPage = 1,
        pageSize = 12,
        sorter = "updatedAt_descend",
        searchKey = ""
      } = params;

      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;

      console.log("query", query);
      try {
        const getCarsData = await this.model
          .find(query)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .populate("make")
          .exec();
        //console.log("All Availble CarsData", AllAvailbleCarsData);
        if (!getCarsData) {
          resolve({});
        } else {
          resolve(JSON.parse(JSON.stringify(getCarsData)));
        }
      } catch (e) {
        console.log("Error fetching details...", e);
        resolve();
      }
    });
  }

  /* Verify car API for admin update query(Car Status: Verified) */
  async updateIsPublished(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }
        let update = {};

        update["$set"] = data;
        const supplier = await this.model.findOneAndUpdate(condition, update, {
          new: true
        });

        resolve(JSON.parse(JSON.stringify(supplier)));
      } catch (e) {
        reject(e);
      }
    });
  }
}
