import {
  JsonController,
  Get,
  Req,
  Res,
  Post,
  Put,
  Patch,
  Body,
  Delete,
  Param,
  QueryParams,
  UseBefore,
  Authorized,
  CurrentUser
} from "routing-controllers";

import { BookingRepository } from "../repositories/bookingRepository";
import { CarRepository } from "../repositories/carRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import { authorizeAction } from "../middlewares/authorizeAction";
import * as randomstring from "randomstring";
import * as fs from "fs";

const pathToAttachment = `public/uploads/contract/Contract_User.pdf`;
const attachment = fs.readFileSync(pathToAttachment).toString("base64");

@JsonController("/user/booking")
export class UserBookingReqController {
  constructor(
    public bookingRepository: BookingRepository,
    public notificationRepository: NotificationRepository
  ) {
    this.bookingRepository = new BookingRepository();
    this.notificationRepository = new NotificationRepository();
  }

  @Post("/bookCar") // for user
  async store(@Body() body: any, @CurrentUser() user: any, @Req() req: any) {
    try {
      let {
        car,
        bookingOption,
        supplier,
        fromDate,
        toDate,
        fromTime,
        toTime,
        pickupLocations,
        dropoffLocations,
        firstName,
        lastName,
        email,
        mobile,
        carAvailableFromDate,
        carAvailableToDate
      } = body;

      console.log("Current user", user);

      const result = await this.bookingRepository.FindCarAvailability({
        car,
        fromDate,
        toDate,
        carAvailableFromDate,
        carAvailableToDate
      });

      let bookingID = randomstring.generate({
        length: 4,
        charset: "alphanumeric"
      });

      bookingID = firstName + "_" + bookingID;
      console.log("bookingID....", bookingID);

      //userData["userType"] = "supplier";
      //userData["supplierID"] = "SUP" + supplierID;

      if (!fromDate) {
        return {
          success: false,
          message: "Please select from date and time",
          data: null
        };
      }

      if (!toDate) {
        return {
          success: false,
          message: "Please select to date and time",
          data: null
        };
      }

      console.log("result", result);

      let length = Object.keys(result).length;

      if (length > 0) {
        return {
          success: true,
          message:
            "Sorry,This car is already booked..! Kindly select some other date",
          data: { isAvailable: false }
        };
      } else {
        car = typeof car === "string" && car ? car : "";
        bookingOption =
          typeof bookingOption === "string" && bookingOption
            ? bookingOption
            : "";
        supplier = typeof supplier === "string" && supplier ? supplier : "";
        user = user ? user["_id"] : null;

        car = typeof car === "string" && car ? car : "";
        fromDate = typeof fromDate === "string" && fromDate ? fromDate : "";
        toDate = typeof toDate === "string" && toDate ? toDate : "";
        fromTime = typeof fromTime === "string" && fromTime ? fromTime : "";
        toTime = typeof toTime === "string" && toTime ? toTime : "";
        pickupLocations =
          typeof pickupLocations === "string" && pickupLocations
            ? pickupLocations
            : "";
        dropoffLocations =
          typeof dropoffLocations === "string" && dropoffLocations
            ? dropoffLocations
            : "";

        firstName = typeof firstName === "string" && firstName ? firstName : "";
        lastName = typeof lastName === "string" && lastName ? lastName : "";
        email = typeof email === "string" && email ? email : "";
        mobile = typeof mobile === "string" && mobile ? mobile : "";
        user = user ? user["_id"] : null;

        if (car) {
          const BookingRequest = {
            car,
            bookingOption,
            supplier,
            fromDate,
            toDate,
            fromTime,
            toTime,
            pickupLocations,
            dropoffLocations,
            user,
            firstName,
            lastName,
            email,
            mobile,
            bookingID
          };

          console.log("Booking car Request .......", BookingRequest);

          const result = await this.bookingRepository.store(BookingRequest);

          let notificationObj = {};
          notificationObj["title"] = "New booking request received..!";
          notificationObj["notificationFor"] = "Admin";
          notificationObj["redirectTo"] = "booking";

          const notification = await this.notificationRepository.store(
            notificationObj
          );
          const sendNotification = req.app.get("sendNotification");
          if (sendNotification) {
            //console.log("IN sendNotification.....");
            sendNotification(notification);
          }

          var sg = require("sendgrid")(
            //"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" // For chaitrali@1
            "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"
          );

          var request = sg.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: {
              personalizations: [
                {
                  to: [
                    {
                      email: email
                    }
                  ],
                  subject: "Car Rental"
                }
              ],
              from: {
                email: "wsiyaruh@wsiyaruh.com",
                name: "Waseet Alsayara"
              },
              content: [
                {
                  type: "text/plain",
                  value:
                    "Hello" +
                    " " +
                    firstName +
                    "  " +
                    lastName +
                    " " +
                    "Your booking request has been submitted successfully..!"
                }
              ],
              attachments: [
                {
                  content: attachment,
                  filename: "Contract_User.pdf",
                  type: "application/pdf",
                  disposition: "attachment"
                }
              ]
            }
          });

          //With callback
          sg.API(request, function(error, response) {
            if (error) {
              //console.log('Error response received', error);
              //res(error);
            } else {
              console.log("response", response);
              console.log("success, Mail sent successfully");
            }
          });

          return {
            success: true,
            message: "Your booking request has been submitted successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "car id, supplier id is requred"
          };
        }
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

  // @Post("/searchCar") // for user
  // async searchCar(@Body() body: any) {
  //   try {
  //     let {
  //       //car,
  //       //bookingOption,
  //       fromDate,
  //       toDate,
  //       pickupLocation,
  //       dropoffLocation
  //     } = body;

  //     //car = typeof car === "string" && car ? car : "";
  //     //bookingOption =
  //     //typeof bookingOption === "string" && bookingOption ? bookingOption : "";
  //     fromDate = typeof fromDate === "string" && fromDate ? fromDate : "";
  //     toDate = typeof toDate === "string" && toDate ? toDate : "";
  //     pickupLocation =
  //       typeof pickupLocation === "string" && pickupLocation
  //         ? pickupLocation
  //         : "";
  //     dropoffLocation =
  //       typeof dropoffLocation === "string" && dropoffLocation
  //         ? dropoffLocation
  //         : "";

  //     var getDates = function(startDate, endDate) {
  //       var dates = [],
  //         currentDate = startDate,
  //         addDays = function(days) {
  //           var date = new Date(this.valueOf());
  //           date.setDate(date.getDate() + days);
  //           return date;
  //         };
  //       while (currentDate <= endDate) {
  //         dates.push(currentDate);
  //         currentDate = addDays.call(currentDate, 1);
  //       }

  //       return dates;
  //     };

  //     // Usage
  //     var dates = getDates(new Date(fromDate), new Date(toDate));

  //     dates.forEach(function(date) {
  //       console.log(date);
  //     });

  //     const searchRequest = {
  //       //car,
  //       //bookingOption,
  //       fromDate,
  //       toDate,
  //       pickupLocation,
  //       dropoffLocation
  //     };

  //     console.log("Booking car Request .......", searchRequest);

  //     const result = await this.bookingRepository.findCar(
  //       //car,
  //       //bookingOption,
  //       // fromDate,
  //       // toDate,
  //       // pickupLocation,
  //       // dropoffLocation
  //       dates
  //     );

  //     return {
  //       success: true,
  //       message: "search car result",
  //       data: result
  //     };
  //   } catch (err) {
  //     if (err.name === "ValidationError") {
  //       return {
  //         success: false,
  //         message: err.message,
  //         data: null
  //       };
  //     }

  //     if (err.name === "MongoError" && err.code === 11000) {
  //       return {
  //         success: false,
  //         message: err.message,
  //         data: null
  //       };
  //     }
  //     console.log("eoror", err);
  //     return {
  //       success: false,
  //       message: "Something went wrong",
  //       data: null
  //     };
  //   }
  // }

  @Authorized()
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      //console.log("get all availble cars...");
      const result = await this.bookingRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "Booking requests",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("booking", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.bookingRepository.softDelete(ids);
      return {
        success: true,
        message: "booking deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  // Aproove booking request for admin
  @UseBefore(authorizeAction("booking", "update"))
  @Put("/:id")
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @CurrentUser() user: any
  ) {
    console.log("Logged in user", user);

    if (user["userType"] === "admin") {
      //console.log("IN IF")
      try {
        let { status } = body;
        if (status) {
          let update = {
            status
          };
        }

        //console.log("body...", body);
        //console.log("id....", id);

        const result = await this.bookingRepository.update({ id }, body);

        if (result) {
          if (status === "approved") {
            // const carRepository = new CarRepository();
            // await carRepository.update(
            //   { id: result["car"] },
            //   { isAvailable: false }
            // );

            //const carRepository = new CarRepository;
            //await carRepository.update({ id: result['car'] }, { isAvailable: false })

            return {
              success: true,
              message:
                "Your booking request status has been updated successfully",
              data: result
            };
          }
        } else {
          return {
            success: false,
            message: "Could not update",
            data: null
          };
        }
      } catch (e) {
        console.log("error ", e.message);
        return { success: false, message: "Something went wrong", data: null };
      }
    } else {
      return {
        success: false,
        message: "you can not approve the request",
        data: null
      };
    }
  }

  //approve or Reject booking request by admin or supplier
  @UseBefore(authorizeAction("booking", "update"))
  @Put("/approveRejectBooking/:id")
  async approveRejectBooking(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any
  ) {
    try {
      let { status } = body;
      if (status) {
        let update = {
          status
        };
      }
      console.log("approveRejectBooking...", body);
      //console.log("id....", id);
      const result = await this.bookingRepository.update({ id }, body);

      if (result) {
        if (status == "approved") {
          return {
            success: true,
            message: "Booking request has been approved successfully",
            data: result
          };
        } else if (status == "rejected") {
          return {
            success: true,
            message: "Booking request has been rejected successfully",
            data: result
          };
        } else if (status === "pending") {
          return {
            success: true,
            message: "Booking request status has been changed to pending.",
            data: result
          };
        }
      } else {
        return {
          success: false,
          message: "Could not update",
          data: null
        };
      }
    } catch (e) {
      console.log("error ", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("booking", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.bookingRepository.findOneBookingReq({
          _id: id
        });
        if (result) {
          return {
            success: true,
            message: "booking request",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find car request for this car",
            data: null
          };
        }
      } else {
        return { success: true, message: "booking id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  // Get booking request of specific user

  // @UseBefore(authorizeAction("user", "read"))
  // @Get("/:id")
  // async get(@Param("id") id: string, @Res() res: any) {
  //   try {
  //     if (id) {
  //       console.log("IDdddd",id)
  //       const result = await this.bookingRepository.findOne({user:id});
  //       if (result) {
  //         return {
  //           success: true,
  //           message: "Booking request for this user",
  //           data: result
  //         };
  //       } else {
  //         return {
  //           success: false,
  //           message: "Could not find booking request for this user",
  //           data: null
  //         };
  //       }
  //     } else {
  //       return { success: true, message: "user id is requred" };
  //     }
  //   } catch (e) {
  //     return { success: false, message: "Something went wrong", data: null };
  //   }
  // }

  // @Post("/searchCar") // for user
  // async searchCar(@Body() body: any, @QueryParams() params: any) {
  //   try {
  //     let {
  //       //car,
  //       //bookingOption,
  //       fromDate,
  //       toDate,
  //       pickupLocation,
  //       dropoffLocation
  //     } = body;

  //     //car = typeof car === "string" && car ? car : "";
  //     //bookingOption =
  //     //typeof bookingOption === "string" && bookingOption ? bookingOption : "";
  //     fromDate = typeof fromDate === "string" && fromDate ? fromDate : "";
  //     toDate = typeof toDate === "string" && toDate ? toDate : "";
  //     pickupLocation =
  //       typeof pickupLocation === "string" && pickupLocation
  //         ? pickupLocation
  //         : "";
  //     dropoffLocation =
  //       typeof dropoffLocation === "string" && dropoffLocation
  //         ? dropoffLocation
  //         : "";

  //     const dateArr = [];
  //     const dateArrBooking = [];
  //     let dates = [];
  //     var getDates = function(startDate, endDate) {
  //       var dates = [],
  //         currentDate = startDate,
  //         addDays = function(days) {
  //           var date = new Date(this.valueOf());
  //           date.setDate(date.getDate() + days);
  //           return date;
  //         };
  //       while (currentDate <= endDate) {
  //         dates.push(currentDate);
  //         currentDate = addDays.call(currentDate, 1);
  //       }
  //       return dates;
  //     };

  //     console.log("dates", dates);

  //     const AllBookings = await this.bookingRepository.findAllPaginated(
  //       Object.assign({}, params)
  //     );
  //     const list = AllBookings["list"];
  //     //console.log("list.........", list);
  //     let fromDates = [];
  //     let toDates = [];
  //     for (var i = 0; i < list.length; i++) {
  //       fromDates.push(list[i].fromDate);
  //       toDates.push(list[i].toDate);
  //       //console.log("fromDates..", fromDates);
  //     }

  //     console.log("fromDates..", fromDates);
  //     console.log("toDates..", toDates);

  //     //const BookedDate=fromDates.concat(toDates);
  //     // Usage: enter Booked dates

  //     for (var k = 0; k < fromDates.length; k++) {
  //       for (var l = 0; l < toDates.length; l++) {
  //         dates = getDates(fromDates[k], toDates[l]);
  //         dates.forEach(function(date) {
  //           dateArr.push(fromDates[k]);
  //           dateArr.push(toDates[l]);

  //           //dateArr is BOOKED DATES ARRAY
  //           //console.log("dateArr...", dateArr);
  //         });
  //       }
  //     }

  //     console.log("dateArr...", dateArr);

  //     // dates = getDates(fromDates, toDates);
  //     // dates.forEach(function(date) {
  //     //   dateArr.push(fromDates.concat(toDates));

  //     //   //dateArr is BOOKED DATES ARRAY
  //     //   console.log("dateArr...", dateArr);
  //     // });

  //     /* console.log(date.getTime()) */

  //     // Enter Booking Date Rage Below

  //     var find_FromDate = fromDate;
  //     var find_ToDate = toDate;

  //     dates = getDates(new Date(fromDate), new Date(toDate));
  //     dates.forEach(function(date) {
  //       dateArrBooking.push(date);

  //       console.log("dateArrBooking...", dateArrBooking);
  //       /* console.log(date.getTime()) */
  //     });

  //     var isAvailable = true;
  //     for (var i = 0; i < dateArr.length; i++) {
  //       if (
  //         dateArr[i] == find_FromDate ||
  //         dateArr[i] == find_ToDate ||
  //         dateArrBooking.includes(dateArr[i])
  //       ) {
  //         isAvailable = false;
  //         break;
  //       }
  //     }
  //     if (isAvailable) {
  //       console.log("Car Is Available");
  //     } else {
  //       console.log("Sorry!!...The Car is Already Booked");
  //     }
  //   } catch (err) {
  //     if (err.name === "ValidationError") {
  //       return {
  //         success: false,
  //         message: err.message,
  //         data: null
  //       };
  //     }

  //     if (err.name === "MongoError" && err.code === 11000) {
  //       return {
  //         success: false,
  //         message: err.message,
  //         data: null
  //       };
  //     }
  //     console.log("eoror", err);
  //     return {
  //       success: false,
  //       message: "Something went wrong",
  //       data: null
  //     };
  //   }
  // }

  @Post("/searchCar") // for user
  async searchCar(@Body() body: any, @QueryParams() params: any) {
    try {
      let {
        //car,
        //bookingOption,
        fromDate,
        toDate,
        pickupLocation,
        dropoffLocation
      } = body;

      //car = typeof car === "string" && car ? car : "";
      //bookingOption =
      //typeof bookingOption === "string" && bookingOption ? bookingOption : "";
      fromDate = typeof fromDate === "string" && fromDate ? fromDate : "";
      toDate = typeof toDate === "string" && toDate ? toDate : "";
      pickupLocation =
        typeof pickupLocation === "string" && pickupLocation
          ? pickupLocation
          : "";
      dropoffLocation =
        typeof dropoffLocation === "string" && dropoffLocation
          ? dropoffLocation
          : "";

      const dateArr = [];
      const dateArrBooking = [];
      let dates = [];
      var getDates = function(startDate, endDate) {
        var dates = [],
          currentDate = startDate,
          addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
          };
        while (currentDate <= endDate) {
          dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }
        return dates;
      };

      console.log("dates", dates);

      const AllBookings = await this.bookingRepository.findAllPaginated(
        Object.assign({}, params)
      );
      const list = AllBookings["list"];
      //console.log("list.........", list);
      let fromDates = [];
      let toDates = [];
      for (var i = 0; i < list.length; i++) {
        fromDates.push(list[i].fromDate);
        toDates.push(list[i].toDate);
        //console.log("fromDates..", fromDates);
      }

      console.log("fromDates..", fromDates);
      console.log("toDates..", toDates);

      //const BookedDate=fromDates.concat(toDates);
      // Usage: enter Booked dates

      for (var k = 0; k < fromDates.length; k++) {
        dates = getDates(new Date(fromDates[k]), new Date(toDates[k]));
        /* console.log("dates : ",dates) */
        dates.forEach(function(date) {
          dateArr.push(date);

          //dateArr is BOOKED DATES ARRAY
          //console.log("dateArr...", dateArr);
        });
      }

      console.log("dateArr...", dateArr);

      // Enter Booking Date Rage Below

      var find_FromDate = fromDate;
      var find_ToDate = toDate;

      dates = getDates(new Date(fromDate), new Date(toDate));
      dates.forEach(function(date) {
        dateArrBooking.push(date);

        /* console.log(date.getTime()) */
      });

      console.log("dateArrBooking...", dateArrBooking);

      var isAvailable = true;
      for (var i = 0; i < dateArr.length; i++) {
        if (
          dateArr[i] == find_FromDate ||
          dateArr[i] == find_ToDate ||
          dateArrBooking.includes(dateArr[i])
        ) {
          isAvailable = false;
          break;
        }
      }
      if (isAvailable) {
        console.log("Car Is Available");
      } else {
        console.log("Sorry!!...The Car is Already Booked");
      }

      var isAvailable = true;
      var isBooked = false;
      let findbookedcarrecordsFromDATE;
      let findbookedcarrecordsToDATE;
      let uniqueBookedCars;
      let bookedCarIds = [];

      let availableCarIds = [];

      function arr_diff(dateArr, dateArrBooking) {
        var arr = [],
          diff = [];

        for (var i = 0; i < dateArr.length; i++) {
          arr[dateArr[i]] = true;
        }

        for (var i = 0; i < dateArrBooking.length; i++) {
          if (arr[dateArrBooking[i]]) {
            delete arr[dateArrBooking[i]];
          } else {
            arr[dateArrBooking[i]] = true;
          }
        }

        for (var k in arr) {
          diff.push(k);
        }

        return diff;
      }

      availableCarIds = arr_diff(dateArr, dateArrBooking);

      //console.log("differnt", arr_diff(dateArr, dateArrBooking));
      // console.log(arr_diff("abcd", "abcde"));
      // console.log(arr_diff("zxc", "zxc"));

      //console.log("availableCarIds", availableCarIds);

      let availableCarIdsINToSTR = [];
      for (var k = 0; k < availableCarIds.length; k++) {
        availableCarIdsINToSTR.push(new Date(availableCarIds[k]));
      }

      console.log("availableCarIdsINToSTR...........", availableCarIdsINToSTR);

      findbookedcarrecordsFromDATE = await this.bookingRepository.findBookedCarIDFROMDATE(
        availableCarIdsINToSTR
      );

      console.log("findbookedcarrecordsFromDATE", findbookedcarrecordsFromDATE);

      for (var i = 0; i < findbookedcarrecordsFromDATE.length; i++) {
        bookedCarIds.push(findbookedcarrecordsFromDATE[i].car);
      }

      findbookedcarrecordsToDATE = await this.bookingRepository.findBookedCarIDTODATE(
        availableCarIdsINToSTR
      );

      for (var i = 0; i < findbookedcarrecordsToDATE.length; i++) {
        bookedCarIds.push(findbookedcarrecordsToDATE[i].car);
      }

      console.log("bookedCarIds", bookedCarIds);

      // for (var i = 0; i < dateArr.length; i++) {
      //   if (dateArrBooking.includes(dateArr[i])) {
      //     findbookedcarrecordsFromDATE = await this.bookingRepository.findBookedCarIDFROMDATE(
      //       fromDates
      //     );

      //     for (var i = 0; i < findbookedcarrecordsFromDATE.length; i++) {
      //       bookedCarIds.push(findbookedcarrecordsFromDATE[i].car);
      //     }

      //     findbookedcarrecordsToDATE = await this.bookingRepository.findBookedCarIDTODATE(
      //       toDates
      //     );

      //     for (var i = 0; i < findbookedcarrecordsToDATE.length; i++) {
      //       bookedCarIds.push(findbookedcarrecordsToDATE[i].car);
      //     }

      //     // console.log("bookedCarIds", bookedCarIds);
      //     // isAvailable = false;
      //     // isBooked = true;

      //     // break;
      //   }
      // }

      // if ((isBooked = true)) {
      //   findbookedcarrecordsFromDATE = await this.bookingRepository.findBookedCarIDFROMDATE(
      //     fromDates
      //   );

      //   for (var i = 0; i < findbookedcarrecordsFromDATE.length; i++) {
      //     bookedCarIds.push(findbookedcarrecordsFromDATE[i].car);
      //   }

      //   // console.log(
      //   //   "findbookedcarrecordsFromDATE",
      //   //   findbookedcarrecordsFromDATE
      //   // );

      //   //console.log("bookedCarIds", bookedCarIds);
      // }

      uniqueBookedCars = [...new Set(bookedCarIds)];
      //console.log("uniqueBookedCars", uniqueBookedCars);

      const carRepository = new CarRepository();
      var result = await carRepository.findAvailbleCars(bookedCarIds);
      return {
        success: true,
        message: "search car result",
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
      console.log("eoror", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  // Get Cars by Location
  @Post("/getCars") // for user
  async getCarsSearch(@Body() body: any, @QueryParams() params: any) {
    try {
      let { pickupLocations, dropoffLocations } = body;
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;

      console.log(pickupLocations);
      console.log(dropoffLocations);

      pickupLocations =
        pickupLocations &&
        typeof pickupLocations === "object" &&
        pickupLocations instanceof Array
          ? pickupLocations
          : [pickupLocations];

      dropoffLocations =
        dropoffLocations &&
        typeof dropoffLocations === "object" &&
        dropoffLocations instanceof Array
          ? dropoffLocations
          : [dropoffLocations];

      const carRepository = new CarRepository();
      var result = await carRepository.getCars(
        pickupLocations,
        dropoffLocations,
        params
      );
      return {
        success: true,
        message: "result",
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
      console.log("eoror", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  // Check Car Availability
  @Post("/checkAvailability") // for user
  async checkAvailability(@Body() body: any, @QueryParams() params: any) {
    try {
      let {
        car,
        fromDate,
        toDate,
        carAvailableFromDate,
        carAvailableToDate
      } = body;

      console.log("checkAvailability Req body", JSON.stringify(body));

      const result = await this.bookingRepository.FindCarAvailability({
        car,
        fromDate,
        toDate,
        carAvailableFromDate,
        carAvailableToDate
      });

      if (!fromDate) {
        return {
          success: false,
          message: "Please select from date and time",
          data: null
        };
      }

      if (!toDate) {
        return {
          success: false,
          message: "Please select to date and time",
          data: null
        };
      }

      console.log("result....", result);

      let length = Object.keys(result).length;

      console.log("length....", length);

      if (length >= 0) {
        console.log("IF 1111");
        if (result != false || result == []) {
          console.log("inner IF 1111");
          return {
            success: true,
            message: "Sorry,This car is already booked.",
            data: { isAvailable: false }
          };
        } else {
          console.log("inner else");
          return {
            success: true,
            message: "Car is available.",
            data: { isAvailable: true }
          };
        }
      } else {
        console.log("IF 22222");
        return {
          success: true,
          message: "Car is available.",
          data: { isAvailable: true }
        };
      }

      // if (length == 0 && result === false) {
      //   console.log("IF 333333");
      //   return {
      //     success: true,
      //     message: "Sorry,This car is already booked.",
      //     data: { isAvailable: false }
      //   };
      // } else {
      //   console.log("IN ELSE..............!");
      //   return {
      //     success: true,
      //     message: "Car is available.",
      //     data: { isAvailable: true }
      //   };
      // }
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

  @Post("/Cancelbooking") // for user
  async cancelReq(@Body() body: any, @CurrentUser() user: any, @Req() req) {
    try {
      let { id, status } = body;

      console.log("Current user", user);

      if (id) {
        //console.log("bookingID .......", bookingID);
        const result = await this.bookingRepository.findOne({
          _id: id
        });

        //console.log("booking result", result);
        //console.log("fromDate", result["fromDate"]);

        const fromDt = result["fromDate"];
        var date = new Date(fromDt);
        console.log("fromDate..", date);

        date.setHours(date.getHours() - 3);
        var dateTimeBefore3Hours = date.toISOString();
        console.log("isodate date minus 3 hours", dateTimeBefore3Hours);

        const CurrrentDate = new Date();
        console.log("CurrrentDate", CurrrentDate);
        var cDt = CurrrentDate.toISOString();

        var FromDate = new Date(fromDt);
        var date1 =
          FromDate.getFullYear() +
          "-" +
          (FromDate.getMonth() + 1) +
          "-" +
          FromDate.getDate();
        var time =
          FromDate.getHours() +
          ":" +
          FromDate.getMinutes() +
          ":" +
          FromDate.getSeconds();
        var dateTimeINISO = date1 + " " + time;

        console.log("FromDate time ", dateTimeINISO);

        var fromdateBefore = new Date(dateTimeBefore3Hours);
        var date2 =
          fromdateBefore.getFullYear() +
          "-" +
          (fromdateBefore.getMonth() + 1) +
          "-" +
          fromdateBefore.getDate();
        var time =
          fromdateBefore.getHours() +
          ":" +
          fromdateBefore.getMinutes() +
          ":" +
          fromdateBefore.getSeconds();
        var dateTimeINISO3 = date2 + " " + time;

        console.log("dateTimeBefore3Hours in time n iso", dateTimeINISO3);

        if (cDt >= dateTimeBefore3Hours) {
          console.log("can not Cancel");
          return {
            success: true,
            message: "Sorry..! You can not cancel the booking now.",
            data: null
          };
        } else {
          console.log("can Cancel");

          const findQueryResult = await this.bookingRepository.findOne({
            _id: id
          });

          console.log("booking current status", findQueryResult["status"]);

          if (
            findQueryResult["status"] == "approved" ||
            findQueryResult["status"] == "pending"
          ) {
            const result = await this.bookingRepository.update(
              { id },
              { status: "canceled" }
            );

            console.log("result....", result);

            let notificationObj = {};
            notificationObj["title"] = "One user has canceled the booking..!";
            notificationObj["notificationFor"] = "Admin";
            notificationObj["redirectTo"] = "booking";

            const notification = await this.notificationRepository.store(
              notificationObj
            );
            const sendNotification = req.app.get("sendNotification");
            if (sendNotification) {
              //console.log("IN sendNotification.....");
              sendNotification(notification);
            }

            return {
              success: true,
              message: "booking canceled successfully..",
              data: result
            };
          } else {
            return {
              success: true,
              message:
                "You can not cancel the booking since its already canceled",
              data: null
            };
          }
        }

        //console.log("CurrrentDate", CurrrentDate);
        //console.log("date in ISO", CurrrentDate.toISOString());

        //if (fromDt >= CurrrentDate) {
        // if (fromDt <= dateTimeBefore3Hours) {
        //   console.log("can Cancel");
        // } else {
        //   console.log("can not Cancel");
        // }

        // var FromDate = new Date(fromDt);
        // var date1 =
        //   FromDate.getFullYear() +
        //   "-" +
        //   (FromDate.getMonth() + 1) +
        //   "-" +
        //   FromDate.getDate();
        // var time =
        //   FromDate.getHours() +
        //   ":" +
        //   FromDate.getMinutes() +
        //   ":" +
        //   FromDate.getSeconds();
        // var dateTimeINISO = date1 + " " + time;

        // console.log("FromDate time ", dateTimeINISO);

        // var fromdateBefore = new Date(dateTimeBefore3Hours);
        // var date2 =
        //   fromdateBefore.getFullYear() +
        //   "-" +
        //   (fromdateBefore.getMonth() + 1) +
        //   "-" +
        //   fromdateBefore.getDate();
        // var time =
        //   fromdateBefore.getHours() +
        //   ":" +
        //   fromdateBefore.getMinutes() +
        //   ":" +
        //   fromdateBefore.getSeconds();
        // var dateTimeINISO3 = date2 + " " + time;

        // console.log("dateTimeBefore3Hours in time n iso", dateTimeINISO3);

        // if (dateTimeINISO3 < dateTimeINISO) {
        //   console.log("can Cancel");
        // } else {
        //   console.log("can not Cancel");
        // }

        // var fromTime = fromDt.replace(/^[^:]*([01]\d:[01]\d).*$/, "$1");

        // console.log("fromTime", fromTime);

        // var beforeFromTime = dateTimeBefore3Hours.replace(
        //   /^[^:]*([01]\d:[01]\d).*$/,
        //   "$1"
        // );

        // console.log("beforeFromTime", beforeFromTime);

        // }

        // else {
        //   console.log("can not Cancel..");
        // }

        // if (fromDt < CurrrentDate) {
        //   console.log("can not Cancel");
        // } else if (
        //   fromDt === dateTimeBefore3Hours ||
        //   fromDt < dateTimeBefore3Hours
        // ) {
        //   console.log("can Cancel");
        // } else {
        //   console.log("Sorry..! You can not Cancel the booking now");
        // }
      } else {
        return {
          success: false,
          message: "bookingID is requred"
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

  //approve or Reject booking request by admin or supplier
  @UseBefore(authorizeAction("booking", "update"))
  @Put("/changePaymentStatus/:id")
  async changePaymentStatus(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any
  ) {
    try {
      const findQueryResult = await this.bookingRepository.findOne({
        _id: id
      });

      console.log("changePaymentStatus...", body);

      if (findQueryResult["status"] == "approved") {
        let { paymentStatus } = body;

        //console.log("id....", id);
        const result = await this.bookingRepository.update({ id }, body);
        if (result) {
          if (paymentStatus == "done") {
            return {
              success: true,
              message: "Payment successful..!",
              data: result
            };
          } else if (paymentStatus == "pending") {
            return {
              success: true,
              message: "payment status is pending..",
              data: result
            };
          } else {
            return {
              success: true,
              message: "Invalid payment status",
              data: result
            };
          }
        } else {
          return {
            success: false,
            message: "Could not update",
            data: null
          };
        }
      } else if (findQueryResult["status"] == "pending") {
        return {
          success: true,
          message:
            "You can not change the payment status of this booking since its status is already pending..!",
          data: null
        };
      } else if (findQueryResult["status"] == "canceled") {
        return {
          success: true,
          message:
            "You can not change the payment status of this booking since its already canceled..!",
          data: null
        };
      }
    } catch (e) {
      console.log("error ", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("booking", "read"))
  @Get("/bookingsForCar/:car")
  async getbookingsForCar(@Param("car") car: string, @Res() res: any) {
    try {
      if (car) {
        //console.log("IDdddd",id)
        const result = await this.bookingRepository.findCarBookings({
          car: car
        });
        if (result) {
          return {
            success: true,
            message: "bookings for this car",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find bookings for this car",
            data: null
          };
        }
      } else {
        return { success: true, message: "car id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @Get("/car-bookedDates/:car")
  async getCarsbookedDates(@Param("car") car: string, @Res() res: any) {
    try {
      if (car) {
        //console.log("IDdddd",id)
        const result = await this.bookingRepository.findCarsBookedDates({
          car: car,
          status: "approved"
        });
        if (result) {
          return {
            success: true,
            message: "Booked Dates for this car",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find booked dates for this car",
            data: null
          };
        }
      } else {
        return { success: true, message: "car id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  // @Get("/getCarByID/:id")
  // async getCarByID(@Param("id") id: string, @Res() res: any) {
  //   try {
  //     if (id) {
  //       const carRepository = new CarRepository();
  //       const result = await carRepository.findOne({ car: id });
  //       if (result) {
  //         return {
  //           success: true,
  //           message: "Car details",
  //           data: result
  //         };
  //       } else {
  //         return {
  //           success: false,
  //           message: "Could not find car request for this car",
  //           data: null
  //         };
  //       }
  //     } else {
  //       return { success: true, message: "car id is requred" };
  //     }
  //   } catch (e) {
  //     console.log("ERROR", e.message);
  //     return { success: false, message: "Something went wrong", data: null };
  //   }
  // }
}
