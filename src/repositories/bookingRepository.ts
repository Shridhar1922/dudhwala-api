import * as mongoose from "mongoose";
import { CarRepository } from "./carRepository";
import { updateLocale } from "moment";
const logger = require("../libs/logger").createLogger("membership.log");

export class BookingRepository {
  private collection = "booking";
  private model: any;
  private defaultSearchColumn = "username";

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  query = {
    isDeleted: false
  };
  /**
   * Store users booking request into DB
   * @param data Object with booking Request details
   */
  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const bookingRequest = new this.model(data);
        console.log("Booking request", bookingRequest);
        const bookingRequestData = await bookingRequest.save();
        console.log("stored", bookingRequestData);
        resolve(JSON.parse(JSON.stringify(bookingRequestData)));
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  findAllPaginated(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt_descend",
          searchColumn = this.defaultSearchColumn,
          searchKey = "",
          status
        } = params;
        let query = { isDeleted: false };
        if (searchColumn && searchKey) {
          query["bookingOption"] = [
            {
              bookingOption: {
                $regex: ".*" + searchKey + ".*",
                $options: "i"
              }
            }
          ];
        }
        if (status) {
          query["status"] = status;
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
          .populate("user")
          .populate("supplier")
          //.populate("car")
          .populate({ path: "car", populate: { path: "make" } })
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

  /* Approve booking request by supplier call update query */
  async update(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }
        let update = {};

        update["$set"] = data;
        const bookingRequest = await this.model.findOneAndUpdate(
          condition,
          update,
          {
            new: true
          }
        );

        //console.log("bookingRequest........",bookingRequest)
        resolve(JSON.parse(JSON.stringify(bookingRequest)));
      } catch (e) {
        reject(e);
      }

      // let updateCarStatus = {};
      // updateCarStatus["$set"] = {'isAvailbel':false};
      // const bookingRequest = await this.model.findOneAndUpdate(condition, update, {
      //   new: true
      // });
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

  /* Approve booking request by supplier call update query */
  async updateCarStatus(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        let update = {};

        update["$set"] = data;
        const bookingRequest = await this.model.findOneAndUpdate(
          condition,
          update,
          {
            new: true
          }
        );

        //console.log("bookingRequest........",bookingRequest)
        resolve(JSON.parse(JSON.stringify(bookingRequest)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findOne(supplier) {
    return new Promise(async (resolve, reject) => {
      try {
        const angle = await this.model.findById(supplier).exec();
        if (angle) {
          return resolve(JSON.parse(JSON.stringify(angle)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findOneBookingReq(_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const Bookings = await this.model
          .findById(_id, this.query)
          .populate("car")
          .populate({ path: "car", populate: { path: "make" } })
          .populate("pickupLocations")
          .populate("dropoffLocations")
          .populate("user")
          .exec();
        return resolve(JSON.parse(JSON.stringify(Bookings)));
        if (Bookings) {
          return {
            success: true,
            message: "Booking",
            data: Bookings
          };
        } else {
          return {
            success: false,
            message: "Could not find any Booking for this id",
            data: null
          };
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findCarBookings(car) {
    return new Promise(async (resolve, reject) => {
      try {
        const Bookings = await this.model
          .find(car, this.query)
          //.populate("car")
          .populate({ path: "car", populate: { path: "make" } })
          .populate("user")
          .exec();
        return resolve(JSON.parse(JSON.stringify(Bookings)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findCarsBookedDates(car) {
    return new Promise(async (resolve, reject) => {
      try {
        const Bookings = await this.model
          .find(car, { fromDate: 1, toDate: 1, bookingOption: 1, status: 1 })
          //.populate("car")
          //.populate({ path: "car", populate: { path: "make" } })
          //.populate("user")
          .exec();
        return resolve(JSON.parse(JSON.stringify(Bookings)));
      } catch (e) {
        reject(e);
      }
    });
  }

  findBookingsCount() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {
          isDeleted: false
        };

        let list = await this.model.find(query).exec();

        //console.log("LIST",list)

        list = JSON.parse(JSON.stringify(list));
        const bookingsTotal = await this.model
          .countDocuments({ isDeleted: false })
          .exec();
        const jsObj = {
          bookings: bookingsTotal
        };
        return resolve(jsObj);
      } catch (e) {
        reject(e);
      }
    });
  }

  findCar(
    //car,
    //bookingOption,
    // fromDate,
    // toDate,
    // pickupLocation,
    // dropoffLocation
    arr
  ) {
    console.log("arr", arr);
    return new Promise(async resolve => {
      let query = {
        fromDate: { $in: arr }
      };

      //console.log("serach Car queryyyy", query);
      try {
        const AllData = await this.model
          .find({ fromDate: { $in: arr } })
          //.populate("car")
          .exec();
        //console.log("search car", AllData);
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

  findBookedCarIDFROMDATE(availableCarIdsINToSTR) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = { fromDate: { $in: availableCarIdsINToSTR } };
        console.log("query....", query);
        const BookedCarRecordFromDate = await this.model.find(query).exec();
        console.log("BookedCarRecordFromDate", BookedCarRecordFromDate);
        if (BookedCarRecordFromDate) {
          return resolve(JSON.parse(JSON.stringify(BookedCarRecordFromDate)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findBookedCarIDTODATE(availableCarIdsINToSTR) {
    return new Promise(async (resolve, reject) => {
      try {
        const BookedCarRecordtoDate = await this.model
          .find({ toDate: { $in: availableCarIdsINToSTR } })
          .exec();
        if (BookedCarRecordtoDate) {
          return resolve(JSON.parse(JSON.stringify(BookedCarRecordtoDate)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  FindCarAvailability({
    car,
    fromDate,
    toDate,
    carAvailableFromDate,
    carAvailableToDate
  }) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("fromDate", fromDate);
        console.log("toDate", toDate);
        console.log("carAvailableFromDate", carAvailableFromDate);
        console.log("carAvailableToDate", carAvailableToDate);
        let condtion1 =
          fromDate >= carAvailableFromDate &&
          fromDate <= carAvailableToDate &&
          toDate >= carAvailableFromDate &&
          toDate <= carAvailableToDate;

        let condition2 =
          fromDate <= fromDate &&
          toDate >= fromDate &&
          fromDate <= toDate &&
          toDate >= toDate;
        // if (
        //   fromDate >= carAvailableFromDate &&
        //   fromDate <= carAvailableToDate &&
        //   toDate >= carAvailableFromDate &&
        //   toDate <= carAvailableToDate
        // ) {
        //   console.log("Car Is AVAILABLE");
        // } else {
        //   console.log("Car Is not  AVAILABLE");
        // }

        if (
          fromDate >= carAvailableFromDate &&
          fromDate <= carAvailableToDate &&
          toDate >= carAvailableFromDate &&
          toDate <= carAvailableToDate
        ) {
          console.log("IN IFF..!");
          console.log("Car Is AVAILABLE");

          let CheckAvailabilityQuery = {
            isDeleted: false,
            car: car,
            $or: [
              {
                fromDate: { $lte: fromDate },
                toDate: { $gte: fromDate }
              },
              {
                fromDate: { $lte: toDate },
                toDate: { $gte: toDate }
              },

              {
                fromDate: { $gt: fromDate },
                toDate: { $lt: toDate }
              },
              {
                fromDate: { $lt: fromDate },
                toDate: { $gt: toDate }
              }
            ],
            $and: [
              {
                $or: [
                  { status: { $ne: "canceled" } },
                  { status: { $ne: "rejected" } }
                ]
              },
              {
                $or: [
                  { status: { $eq: "approved" } },
                  { status: { $eq: "pending" } }
                ]
              }
            ]
          };

          console.log("CheckAvailabilityQuery", CheckAvailabilityQuery);
          const CarAvalability = await this.model
            .find(CheckAvailabilityQuery)
            .exec();
          if (CarAvalability) {
            return resolve(JSON.parse(JSON.stringify(CarAvalability)));
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  findSuppliersBookingRequests({ user, params }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          supplier: user._id
          //$or: [{ status: "pending" }, { paymentStatus: "pending" }]
        };

        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt",
          searchKey = "",
          status
        } = params;

        if (status) {
          Query["status"] = status;
        }

        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;

        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;

        console.log("QUERY.........", Query);
        const suppliercarRecord = await this.model
          .find(Query)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort({ updatedAt: -1 })
          .populate({ path: "car", populate: { path: "make" } })
          .populate("pickupLocations")
          .populate("dropoffLocations")
          .populate("user");
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();

        console.log("find Suppliers Booking Requests.........", Query);

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

  findUserBookingRequest({ user, params }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          user: user._id
          //$or: [{ status: "pending" }, { paymentStatus: "pending" }]
        };

        let {
          currentPage = 1,
          pageSize = 12,
          sorter = "updatedAt",
          searchKey = "",
          status
        } = params;
        if (status) {
          Query["status"] = status;
        }

        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
        currentPage =
          currentPage && !isNaN(parseInt(currentPage))
            ? parseInt(currentPage)
            : 1;
        const suppliercarRecord = await this.model
          .find(Query)
          .skip((currentPage - 1) * pageSize)
          .sort({ updatedAt: -1 })
          .limit(pageSize)
          //.populate("car")
          .populate({ path: "car", populate: { path: "make" } })
          .populate("supplier")
          .exec();
        //console.log("find User BookingRequest Query.........", Query);

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

  findSuppliersPastBookingRequests({ user, params }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          supplier: user._id,
          status: "approved",
          paymentStatus: "done"
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
          //.populate("car")
          .populate({ path: "car", populate: { path: "make" } })
          .populate("user")
          .exec();

        //console.log("find Suppliers Past Booking Requests.........", Query);

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

  findUsersPastBookingRequest({ user, params }) {
    return new Promise(async (resolve, reject) => {
      try {
        let Query = {
          isDeleted: false,
          user: user._id,
          status: "approved",
          paymentStatus: "done"
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
          //.populate("car")
          .populate({ path: "car", populate: { path: "make" } })
          .populate("supplier")
          .exec();
        //console.log("find Users past BookingRequest Query.........", Query);

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

  findBooking({ bookingID }) {
    return new Promise(async (resolve, reject) => {
      try {
        const booking = await this.model.findById(bookingID, this.query).exec();
        if (booking) {
          return resolve(JSON.parse(JSON.stringify(booking)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  // findCar(
  //   dates
  // ) {
  //   return new Promise(async resolve => {
  //     let query = {};

  //     console.log("serachqueryyyy", query);

  //   });
  // }

  // /*
  // Get booking request by userId
  // */

  // findOne(user) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const bookingRequest = await this.model
  //         .findById(user)
  //         .exec();
  //       if (bookingRequest) {
  //         return resolve(JSON.parse(JSON.stringify(bookingRequest)));
  //       } else {
  //         resolve(false);
  //       }
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

  //  working api to give all booking req without filter & pagination

  // /*find all booking details (using populate) for supplier*/
  // FindAllDetails() {
  //   return new Promise(async resolve => {
  //       //let query = {"status" : "Pending"};

  //       try {
  //         const AllData = await this.model
  //           .find(this.query)
  //           .populate(
  //             "user"
  //           )
  //           .populate(
  //             "car"
  //           )
  //           .exec();
  //         //console.log("pending requests DATA", AllData);
  //         if (!AllData) {
  //           resolve({});
  //         } else {
  //           resolve(JSON.parse(JSON.stringify(AllData)));
  //         }
  //       } catch (e) {
  //         console.log("Error fetching details...", e);
  //         resolve();
  //       }

  //   });
  // }
}
