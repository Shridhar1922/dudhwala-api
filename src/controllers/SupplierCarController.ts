// add car
// get car for supplier

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
  Req,
  CurrentUser
} from "routing-controllers";
import { CarRepository } from "../repositories/carRepository";
import { carAddCountRepository } from "../repositories/caraddlimitRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import { authorizeAction } from "../middlewares/authorizeAction";
import * as fs from "fs";
import * as multer from "multer";
// console.log("m", multer);

const maxSize = 10000000 * 90;

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const dest = `uploads/${
      file.fieldname == "images[]" ? "images" : file.fieldname
    }/`;
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
      `${
        file.fieldname == "images[]" ? "images" : file.fieldname
      }-${Date.now()}${file.originalname.replace(" ", "_")}`
    );
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxSize
  }
  //limits: { fieldSize: 25 * 1024 * 1024 }
  //limits: { fileSize: 25 * 1024 * 1024 }
});

@Authorized()
@JsonController("/supplier")
export class CarController {
  constructor(
    public carRepository: CarRepository,
    public notificationRepository: NotificationRepository
  ) {
    this.carRepository = new CarRepository();
    this.notificationRepository = new NotificationRepository();
  }

  @UseBefore(authorizeAction("car", "create"))
  @UseBefore(
    upload.fields([
      { name: "images[]", maxCount: 6 },
      { name: "carLicence", maxCount: 1 },
      { name: "carInsurance", maxCount: 1 },
      { name: "carRegistrationLicense", maxCount: 1 }
    ])
  )
  @Post("/addCar") // for Supplier
  async store(
    @Body() body: any,
    @Req() req: any,
    @CurrentUser() supplier: any
  ) {
    try {
      let {
        companyName,
        carDescription,
        seater,
        carNo,
        make,
        modelNo,
        doors,
        gears,
        airBags,
        carType,
        hourlyRent,
        hourlyAvailbilityTime,
        dailyRent,
        outstationRent,
        images,
        carInsurance,
        insuranceNumber,
        insuranceIssuedDate,
        insuranceExpiryDate,
        fuelType,
        mileage,
        ac,
        //carRegistrationNo,
        carRegistrationLicenseNo,
        features,
        pickupLocations,
        dropoffLocations,
        carRegistrationLicense,
        carRegistrationLicenseIssuedDate,
        carRegistrationLicenseExpiryDate,
        carAvailableFromDate,
        carAvailableToDate
      } = body;

      console.log("Supplier addCar REQUEST..", body);

      const carcountRepository = new carAddCountRepository();
      const carCountResult = await carcountRepository.findAllPaginated(Param);

      let carcount = carCountResult["list"];
      let count = carcount[0].carCount;

      //console.log("carcount .......", carcount[0].carCount);
      //console.log("count.....", count);

      const result = await this.carRepository.findApprovedCarscount({
        supplier: supplier
      });

      //console.log("result...", result);

      let length = Object.keys(result).length;
      //console.log("length", length);

      if (length <= count) {
        companyName =
          companyName && typeof companyName === "string" ? companyName : "";
        carDescription =
          typeof carDescription === "string" && carDescription
            ? carDescription
            : "";
        seater = typeof seater === "string" && seater ? seater : "";
        carNo = typeof carNo === "string" && carNo ? carNo : "";
        carType = typeof carType === "string" && carType ? carType : "";
        hourlyRent =
          typeof hourlyRent === "string" && hourlyRent ? hourlyRent : "";
        hourlyAvailbilityTime =
          typeof hourlyAvailbilityTime === "string" && hourlyAvailbilityTime
            ? hourlyAvailbilityTime
            : "";
        dailyRent = typeof dailyRent === "string" && dailyRent ? dailyRent : "";
        outstationRent =
          typeof outstationRent === "string" && outstationRent
            ? outstationRent
            : "";
        fuelType = typeof fuelType === "string" && fuelType ? fuelType : "";
        mileage = typeof mileage === "string" && mileage ? mileage : "";
        ac = typeof ac === "string" && ac ? ac : "";
        make = typeof make === "string" && make ? make : "";
        modelNo = typeof modelNo === "string" && modelNo ? modelNo : "";
        doors = typeof doors === "string" && doors ? doors : "";
        gears = typeof gears === "string" && gears ? gears : "";
        airBags = typeof airBags === "string" && airBags ? airBags : "";
        // carRegistrationNo =
        //   typeof carRegistrationNo === "string" && carRegistrationNo
        //     ? carRegistrationNo
        //     : "";

        carRegistrationLicenseNo =
          typeof carRegistrationLicenseNo === "string" &&
          carRegistrationLicenseNo
            ? carRegistrationLicenseNo
            : "";

        if (typeof features === "string") {
          features = features.split(", ");
        }
        features = typeof features === "object" && features ? features : [];

        if (typeof pickupLocations === "string") {
          pickupLocations = pickupLocations.split(",");
        }
        pickupLocations =
          pickupLocations &&
          typeof pickupLocations === "object" &&
          pickupLocations instanceof Array
            ? pickupLocations
            : [];

        if (typeof dropoffLocations === "string") {
          dropoffLocations = dropoffLocations.split(",");
        }

        dropoffLocations =
          dropoffLocations &&
          typeof dropoffLocations === "object" &&
          dropoffLocations instanceof Array
            ? dropoffLocations
            : [];

        supplier = supplier ? supplier["_id"] : null;

        carAvailableFromDate =
          typeof carAvailableFromDate === "string" && carAvailableFromDate
            ? carAvailableFromDate
            : "";
        carAvailableToDate =
          typeof carAvailableToDate === "string" && carAvailableToDate
            ? carAvailableToDate
            : "";

        if (companyName && carNo) {
          const Car = {
            companyName,
            carDescription,
            seater,
            carNo,
            carType,
            hourlyRent,
            hourlyAvailbilityTime,
            dailyRent,
            outstationRent,
            fuelType,
            mileage,
            ac,
            make,
            modelNo,
            doors,
            gears,
            airBags,
            //carRegistrationNo,
            carRegistrationLicenseNo,
            carRegistrationLicenseIssuedDate,
            carRegistrationLicenseExpiryDate,
            supplier,
            features,
            pickupLocations,
            dropoffLocations,
            carAvailableFromDate,
            carAvailableToDate
          };
          images = req && req.files ? req.files["images[]"] : [];
          //console.log("REQ............", JSON.stringify(req.files));
          const carInsurance =
            req && req.files ? req.files["carInsurance"] : [];

          const carRegistrationLicense =
            req && req.files ? req.files["carRegistrationLicense"] : [];

          //console.log("images", images);

          // Upload car images
          if (images) {
            const paths = images.map(image => {
              const split = image.path.split("public/");
              if (split && split[1]) {
                return { path: split[1] };
              }
            });
            //console.log("paths", paths);
            if (paths) {
              Car["images"] = paths;
            }
          }

          // Upload Car Licence images
          // if (carLicence) {
          //   const paths = images.map(image => {
          //     const split = image.path.split("public/");
          //     if (split && split[1]) {
          //       return { path: split[1] };
          //     }
          //   });
          //   console.log("paths", paths);
          //   if (paths) {
          //     Car["carLicence"] = paths;
          //   }
          // }

          // Upload Car Insurance image
          // Upload Car Insurance image
          if (carInsurance && carRegistrationLicense) {
            const carInsurancepaths = carInsurance.map(carInsurance => {
              const split = carInsurance.path.split("public/");
              if (split) {
                return { path: split[1] };
              }
            });

            const carRegistrationLicensepaths = carRegistrationLicense.map(
              carRegistrationLicense => {
                const split = carRegistrationLicense.path.split("public/");
                if (split) {
                  return { path: split[1] };
                }
              }
            );

            //if (carInsurance && carRegistrationLicense) {
            Car["documents"] = {
              carInsurance: "Insurance",
              carInsurancepath: carInsurancepaths[0].path,
              insuranceNumber: insuranceNumber,
              insuranceIssuedDate: insuranceIssuedDate,
              insuranceExpiryDate: insuranceExpiryDate,

              //carRegistrationNo: carRegistrationNo,
              carRegistrationLicenseNo: carRegistrationLicenseNo,
              carRegistrationLicense: "carRegistrationLicense",
              carRegistrationLicensepath: carRegistrationLicensepaths[0].path,
              carRegistrationLicenseIssuedDate: carRegistrationLicenseIssuedDate,
              carRegistrationLicenseExpiryDate: carRegistrationLicenseExpiryDate,
              carAvailableFromDate: carAvailableFromDate,
              carAvailableToDate: carAvailableToDate
            };
            //}
          } else {
            return {
              success: false,
              message: "Car Insurance and Car Registration License are required"
            };
          }

          console.log("supplier CAR Request", Car);
          const result = await this.carRepository.store(Car);

          let notificationObj = {};
          notificationObj["title"] = "New car added..!";
          notificationObj["notificationFor"] = "Admin";
          notificationObj["redirectTo"] = "car";

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
            message: "Car added successfully",
            data: result
          };
        } else {
          return {
            success: false,
            message: "car Name and car Number are requred"
          };
        }
      } else {
        return {
          success: false,
          message: "You have exceeded the limit for adding cars",
          data: null
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
      //console.log("error", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  @UseBefore(authorizeAction("car", "update"))
  @UseBefore(
    upload.fields([
      { name: "images[]", maxCount: 5 },
      { name: "carInsurance", maxCount: 1 },
      { name: "carRegistrationLicense", maxCount: 1 }
    ])
  )
  @Put("/editCar/:id")
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @Req() req: any
    //@CurrentUser() supplier: any
  ) {
    try {
      let {
        companyName,
        carDescription,
        seater,
        carNo,
        make,
        modelNo,
        doors,
        gears,
        airBags,
        carType,
        hourlyRent,
        hourlyAvailbilityTime,
        dailyRent,
        outstationRent,
        images,
        carInsurance,
        insuranceNumber,
        insuranceIssuedDate,
        insuranceExpiryDate,
        fuelType,
        mileage,
        ac,
        //carRegistrationNo,
        carRegistrationLicenseNo,
        supplier,
        features,
        pickupLocations,
        dropoffLocations,
        carRegistrationLicense,
        carRegistrationLicenseIssuedDate,
        carRegistrationLicenseExpiryDate,
        carAvailableFromDate,
        carAvailableToDate
      } = body;

      console.log("UPDATE CAR REQUEST..", body);

      companyName =
        companyName && typeof companyName === "string" ? companyName : "";
      carDescription =
        typeof carDescription === "string" && carDescription
          ? carDescription
          : "";
      seater = typeof seater === "string" && seater ? seater : "";
      carNo = typeof carNo === "string" && carNo ? carNo : "";
      carType = typeof carType === "string" && carType ? carType : "";
      hourlyRent =
        typeof hourlyRent === "string" && hourlyRent ? hourlyRent : "";
      hourlyAvailbilityTime =
        typeof hourlyAvailbilityTime === "string" && hourlyAvailbilityTime
          ? hourlyAvailbilityTime
          : "";
      dailyRent = typeof dailyRent === "string" && dailyRent ? dailyRent : "";
      outstationRent =
        typeof outstationRent === "string" && outstationRent
          ? outstationRent
          : "";
      fuelType = typeof fuelType === "string" && fuelType ? fuelType : "";
      mileage = typeof mileage === "string" && mileage ? mileage : "";
      ac = typeof ac === "string" && ac ? ac : "";
      modelNo = typeof modelNo === "string" && modelNo ? modelNo : "";
      doors = typeof doors === "string" && doors ? doors : "";
      gears = typeof gears === "string" && gears ? gears : "";
      airBags = typeof airBags === "string" && airBags ? airBags : "";
      // carRegistrationNo =
      //   typeof carRegistrationNo === "string" && carRegistrationNo
      //     ? carRegistrationNo
      //     : "";

      carRegistrationLicenseNo =
        typeof carRegistrationLicenseNo === "string" && carRegistrationLicenseNo
          ? carRegistrationLicenseNo
          : "";
      supplier = typeof supplier === "string" && supplier ? supplier : "";

      // if (typeof features === "string") {
      //   features = features.split(", ");
      // }
      // features = typeof features === "object" && features ? features : [];

      if (typeof features === "string") {
        features = features.split(",");
      }

      features =
        features && typeof features === "object" && features instanceof Array
          ? features
          : [];

      if (typeof pickupLocations === "string") {
        pickupLocations = pickupLocations.split(",");
      }

      pickupLocations =
        pickupLocations &&
        typeof pickupLocations === "object" &&
        pickupLocations instanceof Array
          ? pickupLocations
          : [];

      if (typeof dropoffLocations === "string") {
        dropoffLocations = dropoffLocations.split(",");
      }

      dropoffLocations =
        dropoffLocations &&
        typeof dropoffLocations === "object" &&
        dropoffLocations instanceof Array
          ? dropoffLocations
          : [];

      if (typeof make === "string") {
        make = make.split(", ");
      }
      make = typeof make === "object" && make ? make : "";

      carAvailableFromDate =
        typeof carAvailableFromDate === "string" && carAvailableFromDate
          ? carAvailableFromDate
          : "";
      carAvailableToDate =
        typeof carAvailableToDate === "string" && carAvailableToDate
          ? carAvailableToDate
          : "";

      let update = {
        companyName,
        carDescription,
        //seater,
        carNo,
        carType,
        hourlyRent,
        dailyRent,
        outstationRent,
        // fuelType,
        // mileage,
        // ac,
        make,
        modelNo,
        // doors,
        // gears,
        // airBags,
        //carRegistrationNo,
        //carRegistrationLicenseNo,
        supplier,
        features,
        pickupLocations,
        dropoffLocations,
        carAvailableFromDate,
        carAvailableToDate
      };

      //console.log("update..", update);

      const Car = await this.carRepository.findOne({ car: id });

      images = req && req.files ? req.files["images[]"] : [];
      //console.log("REQ FILES.........", JSON.stringify(req.files));
      carInsurance = req && req.files ? req.files["carInsurance"] : [];
      carRegistrationLicense =
        req && req.files ? req.files["carRegistrationLicense"] : [];

      if (images) {
        const paths = images.map(images => {
          const split = images.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });
        //console.log("images paths", paths);
        if (paths) {
          update["images"] = paths;
        }
      }

      // // Upload Car Licence images
      // if (carLicence) {
      //   const paths1 = carLicence.map(carLicence => {
      //     const split = carLicence.path.split("public/");
      //     if (split) {
      //       return { path: split[1] };
      //     }
      //   });
      //   if (paths1) {
      //     update["carLicence"] = paths1[0].path;
      //   }
      // } else {
      //   return {
      //     success: false,
      //     message: "Car licence is required"
      //   };
      // }

      // Upload Car Insurance image
      // if (carInsurance) {
      //   const carInsurancepaths = carInsurance.map(carInsurance => {
      //     const split = carInsurance.path.split("public/");
      //     if (split) {
      //       return { path: split[1] };
      //     }
      //   });
      //   if (carInsurancepaths) {
      //     update["carInsurance"] = carInsurancepaths[0].path;
      //   }
      // } else {
      //   return {
      //     success: false,
      //     message: "Car Insurance is required"
      //   };
      // }

      // Upload Car Insurance image
      if (carInsurance) {
        //console.log("in 111111111");
        const carInsurancepaths = carInsurance.map(carInsurance => {
          const split = carInsurance.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        //console.log("carInsurancepaths..", carInsurancepaths);

        update["documents"] = {
          carInsurance: "Insurance",
          carInsurancepath: carInsurancepaths[0].path,
          insuranceNumber: insuranceNumber,
          insuranceIssuedDate: insuranceIssuedDate,
          insuranceExpiryDate: insuranceExpiryDate,

          carRegistrationLicenseNo: Car["documents"].carRegistrationLicenseNo,
          carRegistrationLicense: "carRegistrationLicense",
          carRegistrationLicensepath:
            Car["documents"].carRegistrationLicensepath,
          carRegistrationLicenseIssuedDate:
            Car["documents"].carRegistrationLicenseIssuedDate,
          carRegistrationLicenseExpiryDate:
            Car["documents"].carRegistrationLicenseExpiryDate,

          carAvailableFromDate: carAvailableFromDate,
          carAvailableToDate: carAvailableToDate
        };
      }
      if (carRegistrationLicense) {
        //console.log("in 222222222");
        const carRegistrationLicensepaths = carRegistrationLicense.map(
          carRegistrationLicense => {
            const split = carRegistrationLicense.path.split("public/");
            if (split) {
              return { path: split[1] };
            }
          }
        );
        //console.log("carRegistrationLicensepaths", carRegistrationLicensepaths);

        //}

        //if (carInsurance && carRegistrationLicense) {

        update["documents"] = {
          carInsurance: "Insurance",
          carInsurancepath: Car["documents"].carInsurancepath,
          insuranceNumber: Car["documents"].insuranceNumber,
          insuranceIssuedDate: Car["documents"].insuranceIssuedDate,
          insuranceExpiryDate: Car["documents"].insuranceExpiryDate,

          carRegistrationLicenseNo: carRegistrationLicenseNo,
          carRegistrationLicense: "carRegistrationLicense",
          carRegistrationLicensepath: carRegistrationLicensepaths[0].path,
          carRegistrationLicenseIssuedDate: carRegistrationLicenseIssuedDate,
          carRegistrationLicenseExpiryDate: carRegistrationLicenseExpiryDate,
          carAvailableFromDate: carAvailableFromDate,
          carAvailableToDate: carAvailableToDate
        };
      }

      if (
        insuranceNumber &&
        insuranceIssuedDate &&
        insuranceExpiryDate &&
        carRegistrationLicenseNo &&
        carRegistrationLicenseIssuedDate &&
        carRegistrationLicenseExpiryDate &&
        carInsurance &&
        carRegistrationLicense
      ) {
        //console.log("in |||||||||||||||||||");

        const carInsurancepaths = carInsurance.map(carInsurance => {
          const split = carInsurance.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        const carRegistrationLicensepaths = carRegistrationLicense.map(
          carRegistrationLicense => {
            const split = carRegistrationLicense.path.split("public/");
            if (split) {
              return { path: split[1] };
            }
          }
        );

        update["documents"] = {
          carInsurance: "Insurance",
          carInsurancepath: carInsurancepaths[0].path,
          insuranceNumber: insuranceNumber,
          insuranceIssuedDate: insuranceIssuedDate,
          insuranceExpiryDate: insuranceExpiryDate,

          carRegistrationLicenseNo: carRegistrationLicenseNo,
          carRegistrationLicense: "carRegistrationLicense",
          carRegistrationLicensepath: carRegistrationLicensepaths[0].path,
          carRegistrationLicenseIssuedDate: carRegistrationLicenseIssuedDate,
          carRegistrationLicenseExpiryDate: carRegistrationLicenseExpiryDate,
          carAvailableFromDate: carAvailableFromDate,
          carAvailableToDate: carAvailableToDate
        };
      } else if (
        insuranceNumber &&
        insuranceIssuedDate &&
        insuranceExpiryDate &&
        carRegistrationLicenseNo &&
        carRegistrationLicenseIssuedDate &&
        carRegistrationLicenseExpiryDate &&
        carInsurance
      ) {
        //console.log("in |||||||||||||||||||");

        const carInsurancepaths = carInsurance.map(carInsurance => {
          const split = carInsurance.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        update["documents"] = {
          carInsurance: "Insurance",
          carInsurancepath: carInsurancepaths[0].path,
          insuranceNumber: insuranceNumber,
          insuranceIssuedDate: insuranceIssuedDate,
          insuranceExpiryDate: insuranceExpiryDate,

          carRegistrationLicenseNo: carRegistrationLicenseNo,
          carRegistrationLicense: "carRegistrationLicense",
          carRegistrationLicensepath:
            Car["documents"].carRegistrationLicensepath,
          carRegistrationLicenseIssuedDate: carRegistrationLicenseIssuedDate,
          carRegistrationLicenseExpiryDate: carRegistrationLicenseExpiryDate,
          carAvailableFromDate: carAvailableFromDate,
          carAvailableToDate: carAvailableToDate
        };
      } else if (
        insuranceNumber &&
        insuranceIssuedDate &&
        insuranceExpiryDate &&
        carRegistrationLicenseNo &&
        carRegistrationLicenseIssuedDate &&
        carRegistrationLicenseExpiryDate &&
        carRegistrationLicense
      ) {
        const carRegistrationLicensepaths = carRegistrationLicense.map(
          carRegistrationLicense => {
            const split = carRegistrationLicense.path.split("public/");
            if (split) {
              return { path: split[1] };
            }
          }
        );

        update["documents"] = {
          carInsurance: "Insurance",
          carInsurancepath: Car["documents"].carInsurancepath,
          insuranceNumber: insuranceNumber,
          insuranceIssuedDate: insuranceIssuedDate,
          insuranceExpiryDate: insuranceExpiryDate,

          carRegistrationLicenseNo: carRegistrationLicenseNo,
          carRegistrationLicense: "carRegistrationLicense",
          carRegistrationLicensepath: carRegistrationLicensepaths[0].path,
          carRegistrationLicenseIssuedDate: carRegistrationLicenseIssuedDate,
          carRegistrationLicenseExpiryDate: carRegistrationLicenseExpiryDate,
          carAvailableFromDate: carAvailableFromDate,
          carAvailableToDate: carAvailableToDate
        };
      } else {
        update["documents"] = {
          carInsurance: "Insurance",
          carInsurancepath: Car["documents"].carInsurancepath,
          insuranceNumber: insuranceNumber,
          insuranceIssuedDate: insuranceIssuedDate,
          insuranceExpiryDate: insuranceExpiryDate,

          carRegistrationLicenseNo: carRegistrationLicenseNo,
          carRegistrationLicense: "carRegistrationLicense",
          carRegistrationLicensepath:
            Car["documents"].carRegistrationLicensepath,
          carRegistrationLicenseIssuedDate: carRegistrationLicenseIssuedDate,
          carRegistrationLicenseExpiryDate: carRegistrationLicenseExpiryDate,
          carAvailableFromDate: carAvailableFromDate,
          carAvailableToDate: carAvailableToDate
        };
      }

      // } else {
      //   console.log("in 3333333");
      //   update["documents"] = {
      //     carInsurance: "Insurance",
      //     carInsurancepath: Car["documents"].carInsurancepath,
      //     insuranceNumber: Car["documents"].insuranceNumber,
      //     insuranceIssuedDate: Car["documents"].insuranceIssuedDate,
      //     insuranceExpiryDate: Car["documents"].insuranceExpiryDate,

      //     carRegistrationLicenseNo: Car["documents"].carRegistrationLicenseNo,
      //     carRegistrationLicense: Car["documents"].carRegistrationLicense,
      //     carRegistrationLicensepath:
      //       Car["documents"].carRegistrationLicensepath,
      //     carRegistrationLicenseIssuedDate:
      //       Car["documents"].carRegistrationLicenseIssuedDate,
      //     carRegistrationLicenseExpiryDate:
      //       Car["documents"].carRegistrationLicenseExpiryDate
      //   };
      // }
      //  else {
      //   const Car = await this.carRepository.findOne({ car: id });
      //   update["documents"] = Car["documents"];
      //   console.log("CAR OBJS", Car["documents"].carRegistrationLicensepath);
      // }

      // }
      //}
      console.log("UPDATE CAR final REQ >>..........", update);
      const result = await this.carRepository.update({ id }, update);
      if (result) {
        return {
          success: true,
          message: "Car Details updated successfully",
          data: result
        };
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

  @Get("/getCars")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      //console.log("get all availble cars...");
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.carRepository.findAllPaginated(
        Object.assign({}, params)
      );
      //console.log("RSULTS ", result);
      return {
        success: true,
        message: "All car details",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }
}
