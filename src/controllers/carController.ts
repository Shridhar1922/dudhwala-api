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
  UploadedFile,
  UploadedFiles
} from "routing-controllers";
import { CarRepository } from "../repositories/carRepository";
import { carAddCountRepository } from "../repositories/caraddlimitRepository";
import { BookingRepository } from "../repositories/bookingRepository";
import { UserRepository } from "../repositories/userRepositories";

import { authorizeAction } from "../middlewares/authorizeAction";
import * as fs from "fs";
import * as multer from "multer";
// console.log("m", multer);

const maxSize = 10000000 * 90;

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

const upload = multer({
  storage,
  limits: {
    fileSize: maxSize
  }
  // limits: { fieldSize: 25 * 1024 * 1024 }
  // limits: { fileSize: 25 * 1024 * 1024 }
});

@Authorized()
@JsonController("/car")
export class CarController {
  carAddCountRepository: any;
  BookingRepository: any;
  UserRepository: any;
  constructor(public carRepository: CarRepository) {
    this.carRepository = new CarRepository();
  }

  @UseBefore(authorizeAction("car", "create"))
  @UseBefore(
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "carLicence", maxCount: 1 },
      { name: "carInsurance", maxCount: 1 },
      { name: "carRegistrationLicense", maxCount: 1 }
    ])
  )
  @Post("/") // for admin   (add car API)
  async store(@Body() body: any, @Req() req: any) {
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

      console.log("REQUEST..", body);

      const carcountRepository = new carAddCountRepository();
      const carCountResult = await carcountRepository.findAllPaginated(Param);
      let carcount = carCountResult["list"];
      let count = carcount[0].carCount;

      //console.log("carcount carcount .......", carcount[0].carCount);
      //console.log("count.....", count);

      const result = await this.carRepository.findApprovedCarscount({
        supplier: supplier
      });
      let length = Object.keys(result).length;
      console.log("length", length);

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
        airBags = typeof airBags === "string" && airBags ? airBags : "";
        dailyRent = typeof dailyRent === "string" && dailyRent ? dailyRent : "";
        outstationRent =
          typeof outstationRent === "string" && outstationRent
            ? outstationRent
            : "";
        fuelType = typeof fuelType === "string" && fuelType ? fuelType : "";
        mileage = typeof mileage === "string" && mileage ? mileage : "";
        ac = typeof ac === "string" && ac ? ac : "";
        //make = typeof make === "string" && make ? make : "";
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
        supplier = typeof supplier === "string" && supplier ? supplier : "";

        if (typeof make === "string") {
          make = make.split(", ");
        }
        make = typeof make === "object" && make ? make : "";

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

        // carAvailableFromDate =
        //   typeof carAvailableFromDate === "string" && carAvailableFromDate
        //     ? carAvailableFromDate
        //     : "";
        // carAvailableToDate =
        //   typeof carAvailableToDate === "string" && carAvailableToDate
        //     ? carAvailableToDate
        //     : "";

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
            //carRegistrationLicenseNo,
            insuranceIssuedDate,
            insuranceExpiryDate,
            carRegistrationLicenseIssuedDate,
            carRegistrationLicenseExpiryDate,
            supplier,
            features,
            pickupLocations,
            dropoffLocations,
            carAvailableFromDate,
            carAvailableToDate
          };

          console.log("Car..", Car);

          const images = req && req.files ? req.files["images"] : [];
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
            console.log("paths", paths);
            if (paths) {
              Car["images"] = paths;
            }
          } else {
            return {
              success: false,
              message: "Car images are required"
            };
          }

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
          }
          // }
          else {
            return {
              success: false,
              message: "Car Insurance and Car Registration License are required"
            };
          }

          Car["createdDateLocal"] = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Calcutta"
          });
          Car["updatedDateLocal"] = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Calcutta"
          });

          Car["status"] = "approved";

          console.log("CAR Request", Car);

          const result = await this.carRepository.store(Car);

          const userRepository = new UserRepository();
          const UserData = await userRepository.findOneUser({ _id: supplier });

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
                      email: UserData["email"]
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
                  value: "Your car has been approved."
                }
              ]
            }
          });
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
      console.log("eoror", err);
      return {
        success: false,
        message: "Something went wrong",
        data: null
      };
    }
  }

  @UseBefore(upload.fields([{ name: "images", maxCount: 6 }]))
  @Post("/uploadImage")
  async uploadImage(@Body() body: any, @Req() req: any) {
    try {
      const images = req && req.files ? req.files["images"] : [];

      //console.log("images", images);

      // Upload car images
      if (images) {
        const paths = images.map(image => {
          const split = image.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });
        console.log("paths", paths);
        return {
          success: true,
          message: "images uploaded",
          path: paths
        };
      } else {
        return {
          success: false,
          message: "Car images are required"
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

  @UseBefore(authorizeAction("car", "read"))
  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      console.log("get all availble cars...");
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

  // working code for updating only car carLicence
  @UseBefore(authorizeAction("car", "update"))
  @UseBefore(
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "carInsurance", maxCount: 1 },
      { name: "carRegistrationLicense", maxCount: 1 }
    ])
  )
  @Put("/:id")
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @Req() req: any
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

      // carAvailableFromDate =
      //   typeof carAvailableFromDate === "string" && carAvailableFromDate
      //     ? carAvailableFromDate
      //     : "";
      // carAvailableToDate =
      //   typeof carAvailableToDate === "string" && carAvailableToDate
      //     ? carAvailableToDate
      //     : "";

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

      console.log("update..", update);

      const Car = await this.carRepository.findOne({ car: id });

      images = req && req.files ? req.files["images"] : [];
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
        console.log("images paths", paths);
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

        console.log("carInsurancepaths..", carInsurancepaths);

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
        console.log("carRegistrationLicensepaths", carRegistrationLicensepaths);

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
        console.log("in |||||||||||||||||||");

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
        console.log("in |||||||||||||||||||");

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
        console.log("in |||||||||||||||||||");

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
      console.log("UPDATE CAR REQ >>>>>>>>>>>>>>>>>>>>>>>>>..........", update);
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

  @UseBefore(authorizeAction("car", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.carRepository.findOne({ car: id });
        if (result) {
          return {
            success: true,
            message: "Car request for this car",
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
        return { success: true, message: "car id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @UseBefore(authorizeAction("car", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.carRepository.softDelete(ids);
      return {
        success: true,
        message: "Car deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  // Aproove supplier (For Admin)
  @UseBefore(authorizeAction("car", "update"))
  @Put("/verifyCar/:id")
  async update1(@Param("id") id: string, @Body() body: any, @Res() res: any) {
    try {
      let { status } = body;
      if (status) {
        let update = {
          status
        };
      }
      console.log("verify car request...", body);
      console.log("id....", id);

      const result = await this.carRepository.updateCarStatus({ id }, body);

      if (result) {
        return {
          success: true,
          message: "Car status has been updated successfully",
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

  //approve or Reject car by admin
  @UseBefore(authorizeAction("car", "update"))
  @Put("/approveRejectCar/:id")
  async approveRejectCar(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any
  ) {
    try {
      let { status, rejectReason, supplier } = body;
      if (status) {
        let update = {
          status,
          rejectReason
        };
      }
      //console.log("approveCar...", body);
      //console.log("id....", id);
      const userRepository = new UserRepository();
      const result = await this.carRepository.updateCarStatus({ id }, body);
      const UserData = await userRepository.findOneUser({ _id: supplier });
      //console.log("UserData....", UserData);

      if (result) {
        if (status == "approved") {
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
                      email: UserData["email"]
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
                  value: "Your car has been approved."
                }
              ]
            }
          });
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
            message: "Car has been approved successfully",
            data: result
          };
        } else if (status == "rejected") {
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
                      email: UserData["email"]
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
                  value: "Your car has been rejected."
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
            message: "Car has been rejected by the admin",
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

  // // Reject Car by the admin with reject reason
  // @UseBefore(authorizeAction("car", "update"))
  // @Put("/rejectCar/:id")
  // async rejectCar(@Param("id") id: string, @Body() body: any, @Res() res: any) {
  //   try {
  //     let { status, rejectReason } = body;
  //     if (status) {
  //       let update = {
  //         status,
  //         rejectReason
  //       };
  //     }
  //     //console.log("rejectCar request...", body);
  //     //console.log("id....", id);

  //     const result = await this.carRepository.updateCarStatus({ id }, body);

  //     if (result) {
  //       return {
  //         success: true,
  //         message: "Car has been rejected by the admin",
  //         data: result
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         message: "Could not update",
  //         data: null
  //       };
  //     }
  //   } catch (e) {
  //     console.log("error ", e.message);
  //     return { success: false, message: "Something went wrong", data: null };
  //   }
  // }

  //publish or Ubpublished car API by admin
  @UseBefore(authorizeAction("car", "update"))
  @Put("/publishCar/:id")
  async publishCar(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any
  ) {
    try {
      let { isPublished } = body;
      if (isPublished) {
        let update = {
          isPublished
        };
      }
      //console.log("approveCar...", body);
      //console.log("id....", id);

      const carData = await this.carRepository.findOne({ car: id });
      //console.log("carData....", carData);
      //console.log("car Status....", carData["status"]);

      if (carData["status"] == "approved") {
        const result = await this.carRepository.updateIsPublished({ id }, body);

        if (result) {
          return {
            success: true,
            message: "Car publish status has been updated successfully",
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
        return {
          success: false,
          message:
            "This car is not approved by the admin yet..Once approve you can publish the car",
          data: null
        };
      }
    } catch (e) {
      console.log("error ", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  // @UseBefore(authorizeAction("car", "read"))
  // @Get("/supplier/car-details/:supplier")
  // async getSupplierCars(@Param("supplier") supplier: string, @Res() res: any) {
  //   try {
  //     if (supplier) {
  //       console.log("IDdddd", supplier);
  //       const result = await this.carRepository.findSupplierCars({
  //         supplier: supplier
  //       });
  //       if (result) {
  //         return {
  //           success: true,
  //           message: "Cars of this supplier",
  //           data: result
  //         };
  //       } else {
  //         return {
  //           success: false,
  //           message: "Could not find any car for this supplier",
  //           data: null
  //         };
  //       }
  //     } else {
  //       return { success: true, message: "supplier id is requred" };
  //     }
  //   } catch (e) {
  //     console.log("ERROR", e.message);
  //     return { success: false, message: "Something went wrong", data: null };
  //   }
  // }

  @UseBefore(authorizeAction("car", "read"))
  @Get("/forsupplier/count/:supplier")
  async AddCarCountCheck(@Param("supplier") supplier: string, @Res() res: any) {
    try {
      if (supplier) {
        //console.log("supplier IDdddd", supplier);
        const result = await this.carRepository.findApprovedCarscount({
          supplier: supplier
        });

        //console.log("result........", result);

        let length = Object.keys(result).length;
        //console.log("length........", length);

        if (result) {
          return {
            success: true,
            message: "Cars of this supplier",
            data: length
          };
        } else {
          return {
            success: false,
            message: "Could not find any car for this supplier",
            data: null
          };
        }
      } else {
        return { success: true, message: "supplier id is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  //@UseBefore(authorizeAction("car", "update"))
  @Put("/deleteImage/:id")
  async img(@Param("id") id: string, @Body() body: any, @Res() res: any) {
    try {
      const data = await this.carRepository.findOne({ car: id });
      let { keyName, path } = body;
      let update;

      console.log("deleteImage body", body);

      if (keyName === "carLicence") {
        update = {
          $set: { carLicence: "" }
        };
      } else if (keyName === "carInsurance") {
        update = {
          $set: { "documents.carInsurancepath": "" }
        };
      } else if (keyName === "carRegistrationLicense") {
        update = {
          $set: {
            "documents.carRegistrationLicensepath": ""
          }
        };
      } else if (keyName === "images") {
        update = {
          $pull: { images: { path: path } }
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

      const result = await this.carRepository.updateImages({ id }, update);
      console.log("result", result);
      {
        if (result) {
          return {
            success: true,
            message: "Image deleted successfully"
            //data: result
          };
        } else {
          return {
            success: false,
            message: "Could not update",
            data: data
          };
        }
      }
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @Post("/searchCar") // for user
  async searchCar(@Body() body: any) {
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

      // Usage
      var dates = getDates(new Date(fromDate), new Date(toDate));

      dates.forEach(function(date) {
        console.log(date);
      });

      const searchRequest = {
        //car,
        //bookingOption,
        fromDate,
        toDate,
        pickupLocation,
        dropoffLocation
      };

      console.log("Booking car Request .......", searchRequest);

      const bookingRepository = new BookingRepository();

      const result = await this.carRepository.findCar(
        //car,
        //bookingOption,
        fromDate,
        toDate,
        // pickupLocation,
        // dropoffLocation
        dates
      );

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
}
