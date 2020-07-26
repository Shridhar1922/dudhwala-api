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
import * as mongoose from "mongoose";
import { UserRepository } from "../repositories/userRepositories";
import { CarRepository } from "../repositories/carRepository";
import { BookingRepository } from "../repositories/bookingRepository";

import * as authService from "../libs/authService";
import { authorizeAction } from "../middlewares/authorizeAction";

import * as fs from "fs";
import * as multer from "multer";
// console.log("m", multer);

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

const upload = multer({ storage });

@Authorized()
@JsonController("/user")
export class AuthController {
  constructor(public userRepository: UserRepository) {
    this.userRepository = new UserRepository();
  }

  @Get("/ping")
  ping(@Req() request: any, @Res() response: any) {
    return response.send({ message: "Hello there.." });
  }

  // admin add
  @UseBefore(authorizeAction("user", "create"))
  @Post("/")
  async store(@Body() body: any, @Res() res: any) {
    try {
      let {
        firstName,
        lastName,
        email,
        mobile,
        role,
        address,
        password,
        cpassword,
        username,
        userType
      } = body;
      firstName = firstName && typeof firstName === "string" ? firstName : "";
      lastName = lastName && typeof lastName === "string" ? lastName : "";
      email = email && typeof email === "string" ? email : "";
      mobile = mobile && typeof mobile === "string" ? mobile : "";
      role = role && typeof role === "string" ? role : "";
      address = address && typeof address === "string" ? address : "";
      username = username && typeof username === "string" ? username : "";
      if (typeof password === "string" && password.length > 5) {
        if (password === cpassword) {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
          if (re.test(email)) {
            let userData = {
              firstName,
              lastName,
              username,
              email,
              role,
              mobile,
              password,
              address,
              isDeleted: false,
              status: "approved",
              userType
            };
            try {
              // console.log("Storing user details...");
              await this.userRepository.store(userData);
              return res.send({
                success: true,
                message: "User details stored successfully",
                data: {}
              });
            } catch (e) {
              if (e.name === "ValidationError") {
                return {
                  success: false,
                  message: e.message,
                  data: null
                };
              }
              return res.status(500).send({
                success: false,
                message: e.message,
                data: null
              });
            }
          } else {
            // EMAIL NOT VALID
            return res.status(200).send({
              success: false,
              message: "Email ID is not valid",
              data: null
            });
          }
        } else {
          // PASSWORD DOES NOT MATCH
          return res.status(200).send({
            success: false,
            message: "Password does not match",
            data: null
          });
        }
      } else {
        // PASSWORD IS NOT STRONG
        return {
          success: false,
          message: "Password length must be greater than 5",
          data: null
        };
      }
    } catch (e) {
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("user", "read"))
  @Get("/:id")
  async getUser(@Param("id") id: string, @Res() res: any) {
    try {
      const user = await this.userRepository.findOne({ supplier: id });
      if (user) {
        delete user["password"];
        // console.log("User fetched", user);
        return res.send({ success: true, message: "User found", data: user });
      }
      return res.status.send({
        success: true,
        message: "User not found",
        data: {}
      });
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null });
    }
  }

  //@UseBefore(authorizeAction("user", "read"))
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
      const result = await this.userRepository.findAllPaginated(
        Object.assign({}, params, { pageSize, currentPage })
      );
      return res.send({
        success: true,
        message: "User detaills",
        data: result
      });
    } catch (e) {
      // console.log("Error", e);
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong", data: null });
    }
  }

  
  @UseBefore(
    upload.fields([
      { name: "license", maxCount: 1 },
      { name: "idProof", maxCount: 1 }
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
        firstName,
        lastName,
        username,
        email,
        mobile,
        address,
        license,
        idProof,
        licenseNumber,
        licenseIssuedDate,
        licenseExpiryDate
      } = body;

      //console.log("UPDATE User REQUEST..", body);

      firstName = typeof firstName === "string" && firstName ? firstName : "";
      lastName = typeof lastName === "string" && lastName ? lastName : "";
      username = typeof username === "string" && username ? username : "";
      email = typeof email === "string" && email ? email : "";
      mobile = typeof mobile === "string" && mobile ? mobile : "";
      address = typeof address === "string" && address ? address : "";

      let update = {
        firstName,
        lastName,
        username,
        email,
        mobile,
        address,
        licenseNumber,
        licenseIssuedDate,
        licenseExpiryDate
      };

      const User = await this.userRepository.findOneUser({ _id: id });
      //console.log("User..", User);

      license = req && req.files ? req.files["license"] : [];
      idProof = req && req.files ? req.files["idProof"] : [];

      if (idProof) {
        const idProofpaths = idProof.map(idProof => {
          const split = idProof.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        //console.log("idProofpaths", idProofpaths);

        update["documents"] = {
          idProof: "idProof",
          idProofpath: idProofpaths[0].path,
          license: "Licence",
          licensepath: User["documents"].licensepath,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
        // } else {
        //   update["documents"] = {
        //     idProof: "idProof",
        //     idProofpath: User["documents"].idProofpath,
        //     license: "Licence",
        //     licensepath: User["documents"].licensepath,
        //     licenseNumber: licenseNumber,
        //     licenseIssuedDate: licenseIssuedDate,
        //     licenseExpiryDate: licenseExpiryDate
        //   };
      }
      if (license) {
        const paths = license.map(license => {
          const split = license.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });
        //console.log("paths", paths);
        update["documents"] = {
          idProof: "idProof",
          idProofpath: User["documents"].idProofpath,
          license: "Licence",
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
      }
      if (idProof && license) {
        const idProofpaths = idProof.map(idProof => {
          const split = idProof.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        //console.log("idProofpaths", idProofpaths);

        const paths = license.map(license => {
          const split = license.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });

        update["documents"] = {
          idProof: "idProof",
          idProofpath: idProofpaths[0].path,
          license: "Licence",
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
      }
      //else if (licenseNumber || licenseIssuedDate || licenseExpiryDate) {
      //   console.log("4444444444444");

      //   update["documents"] = {
      //     idProof: "idProof",
      //     idProofpath: User["documents"].idProofpath,
      //     license: "Licence",
      //     licensepath: User["documents"].licensepath,
      //     licenseNumber: licenseNumber,
      //     licenseIssuedDate: licenseIssuedDate,
      //     licenseExpiryDate: licenseExpiryDate
      //   };
      // }

      if (
        idProof &&
        license &&
        licenseNumber &&
        licenseIssuedDate &&
        licenseExpiryDate
      ) {
        const idProofpaths = idProof.map(idProof => {
          const split = idProof.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        //console.log("idProofpaths", idProofpaths);

        const paths = license.map(license => {
          const split = license.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });

        update["documents"] = {
          idProof: "idProof",
          idProofpath: idProofpaths[0].path,
          license: "Licence",
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
      } else if (
        idProof &&
        licenseNumber &&
        licenseIssuedDate &&
        licenseExpiryDate
      ) {
        const idProofpaths = idProof.map(idProof => {
          const split = idProof.path.split("public/");
          if (split) {
            return { path: split[1] };
          }
        });

        update["documents"] = {
          idProof: "idProof",
          idProofpath: idProofpaths[0].path,
          license: "Licence",
          licensepath: User["documents"].licensepath,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
      } else if (
        license &&
        licenseNumber &&
        licenseIssuedDate &&
        licenseExpiryDate
      ) {
        const paths = license.map(license => {
          const split = license.path.split("public/");
          if (split && split[1]) {
            return { path: split[1] };
          }
        });

        update["documents"] = {
          idProof: "idProof",
          idProofpath: User["documents"].idProofpath,
          license: "Licence",
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
      } else {
        update["documents"] = {
          idProof: "idProof",
          idProofpath: User["documents"].idProofpath,
          license: "Licence",
          licensepath: User["documents"].licensepath,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate
        };
      }

      // if (licenseNumber || licenseIssuedDate || licenseExpiryDate) {
      //   console.log("4444444444444");

      //   update["documents"] = {
      //     idProof: "idProof",
      //     idProofpath: User["documents"].idProofpath,
      //     license: "Licence",
      //     licensepath: User["documents"].licensepath,
      //     licenseNumber: licenseNumber,
      //     licenseIssuedDate: licenseIssuedDate,
      //     licenseExpiryDate: licenseExpiryDate
      //   };
      // }

      // if (idProof && licenseNumber && licenseIssuedDate && licenseExpiryDate) {
      //   console.log("4444444444444");

      //   const idProofpaths = idProof.map(idProof => {
      //     const split = idProof.path.split("public/");
      //     if (split) {
      //       return { path: split[1] };
      //     }
      //   });

      //   update["documents"] = {
      //     idProof: "idProof",
      //     idProofpath: idProofpaths[0].path,
      //     license: "Licence",
      //     licensepath: User["documents"].licensepath,
      //     licenseNumber: licenseNumber,
      //     licenseIssuedDate: licenseIssuedDate,
      //     licenseExpiryDate: licenseExpiryDate
      //   };
      // else {
      //   console.log("IN ELSE....");
      //   update["documents"] = {
      //     idProof: "idProof",
      //     idProofpath: User["documents"].idProofpaths,
      //     license: "Licence",
      //     licensepath: User["documents"].licensepath,
      //     licenseNumber: User["documents"].licenseNumber,
      //     licenseIssuedDate: User["documents"].licenseIssuedDate,
      //     licenseExpiryDate: User["documents"].licenseExpiryDate
      //   };
      // }

      // update["documents"] = {
      //   idProof: "idProof",
      //   idProofpath: User["documents"].idProofpaths,
      //   license: "Licence",
      //   licensepath: User["documents"].licensepath,
      //   licenseNumber: User["documents"].licenseNumber,
      //   licenseIssuedDate: User["documents"].licenseIssuedDate,
      //   licenseExpiryDate: User["documents"].licenseExpiryDate
      // };

      console.log("Final UPDATE User REQ ..........", update);
      const result = await this.userRepository.update({ id }, update);
      if (result) {
        return {
          success: true,
          message: "User Details updated successfully",
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

  //@UseBefore(authorizeAction("user", "update"))
  @Delete("/")
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body;
      ids =
        ids && typeof ids === "object" && ids instanceof Array ? ids : [ids];
      const result = await this.userRepository.softDelete(ids);
      return {
        success: true,
        message: "user deleted successfully",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @UseBefore(authorizeAction("user", "read"))
  @Get("/:id")
  async get(@Param("id") id: string, @Res() res: any) {
    try {
      if (id) {
        //console.log("IDdddd",id)
        const result = await this.userRepository.findOne({ supplier: id });
        if (result) {
          return {
            success: true,
            message: "Supplier details",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find supplier for this id",
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

  // Aproove supplier/user (For Admin)
  @UseBefore(authorizeAction("user", "update"))
  @Put("/approveRejectUser/:id")
  async update1(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: any,
    @CurrentUser() user: any
  ) {
    console.log("Logged in user", user);
    if (user["userType"] == "admin") {
      try {
        let { status } = body;
        if (status) {
          let update = {
            status
          };
        }

        console.log("approveRejectUser request...", body);
        console.log("id....", id);

        const result = await this.userRepository.updateSupplierStatus(
          { id },
          body
        );

        const UserData = await this.userRepository.findOneUser({ _id: id });
        //console.log("UserData..", UserData["email"]);

        if (result) {
          // return {
          //   success: true,
          //   message: "User has been updated successfully",
          //   data: result
          // };
          // if (status == "approved") {
          //   var sg = require("sendgrid")(
          //     //"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" // For chaitrali@1
          //     "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"
          //   );

          //   var request = sg.emptyRequest({
          //     method: "POST",
          //     path: "/v3/mail/send",
          //     body: {
          //       personalizations: [
          //         {
          //           to: [
          //             {
          //               email: UserData["email"]
          //             }
          //           ],
          //           subject: "Car Rental"
          //         }
          //       ],
          //       from: {
          //         email: "wsiyaruh@wsiyaruh.com",
          //         name: "Waseet Alsayara"
          //       },
          //       content: [
          //         {
          //           type: "text/plain",
          //           value: "Your account has been approved."
          //         }
          //       ]
          //       //  attachments: [
          //       //    {
          //       //      content: attachment,
          //       //      filename: "Contract_User.pdf",
          //       //      type: "application/pdf",
          //       //      disposition: "attachment"
          //       //    }
          //       //  ]
          //     }
          //   });

          //   //With callback
          //   sg.API(request, function(error, response) {
          //     if (error) {
          //       //console.log('Error response received', error);
          //       //res(error);
          //     } else {
          //       console.log("response", response);
          //       console.log("success, Mail sent successfully");
          //     }
          //   });

          //   return {
          //     success: true,
          //     message: "User has been approved successfully",
          //     data: result
          //   };
          // } else if (status == "rejected") {
          //   var sg = require("sendgrid")(
          //     //"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" // For chaitrali@1
          //     "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"
          //   );

          //   var request = sg.emptyRequest({
          //     method: "POST",
          //     path: "/v3/mail/send",
          //     body: {
          //       personalizations: [
          //         {
          //           to: [
          //             {
          //               email: UserData["email"]
          //             }
          //           ],
          //           subject: "Car Rental"
          //         }
          //       ],
          //       from: {
          //         email: "wsiyaruh@wsiyaruh.com",
          //         name: "Waseet Alsayara"
          //       },
          //       content: [
          //         {
          //           type: "text/plain",
          //           value: "Your account has been rejected."
          //         }
          //       ]
          //       //  attachments: [
          //       //    {
          //       //      content: attachment,
          //       //      filename: "Contract_User.pdf",
          //       //      type: "application/pdf",
          //       //      disposition: "attachment"
          //       //    }
          //       //  ]
          //     }
          //   });

          //   //With callback
          //   sg.API(request, function(error, response) {
          //     if (error) {
          //       //console.log('Error response received', error);
          //       //res(error);
          //     } else {
          //       console.log("response", response);
          //       console.log("success, Mail sent successfully");
          //     }
          //   });

          //   return {
          //     success: true,
          //     message: "User has been rejected successfully",
          //     data: result
          //   };
          // }
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
        message: "You are not authrizied person for this action",
        data: null
      };
    }
  }

  @Get("/get/dashboardCount")
  async getUsersCount(@QueryParams() params: any, @Res() res: any) {
    try {
      console.log("get users count..");
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      const result = await this.userRepository.findUsersCount();
      //const result2 = await this.carRepository.findAllUsers()
      //Object.assign({}, params);
      //console.log("RSULTS ", result);

      const carRepository = new CarRepository();
      const carCount = await carRepository.findCarsCount();
      result["cars"] = carCount["cars"];

      const bookingRepository = new BookingRepository();
      const bookingsCount = await bookingRepository.findBookingsCount();
      result["bookings"] = bookingsCount["bookings"];

      return {
        success: true,
        message: "Dashboard Counts",
        data: result
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: null };
    }
  }

  @Get("/get/bookingRequest")
  async getUserCarsBookingRequets(
    @Res() res: any,
    @CurrentUser() user: any,
    @QueryParams() params: any
  ) {
    try {
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      if (user._id) {
        console.log("logged in user", user);
        //console.log("supplier id", user._id);

        const bookingRepository = new BookingRepository();
        const result = await bookingRepository.findUserBookingRequest({
          user,
          params
        });
        //console.log("User Booking Requets", result);
        if (result) {
          return {
            success: true,
            message: "booking request for this user",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find any booking request for this user",
            data: null
          };
        }
      } else {
        return { success: true, message: "User login is requred" };
      }
    } catch (e) {
      console.log("ERROR", e.message);
      return { success: false, message: "Something went wrong", data: null };
    }
  }

  @Get("/get/past-bookingRequest")
  async getUserCarsPastBookingRequets(
    @Res() res: any,
    @CurrentUser() user: any,
    @QueryParams() params: any
  ) {
    try {
      let { pageSize, currentPage } = params;
      pageSize =
        pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12;
      currentPage =
        currentPage && !isNaN(parseInt(currentPage))
          ? parseInt(currentPage)
          : 1;
      if (user._id) {
        console.log("logged in user", user);
        //console.log("supplier id", user._id);

        const bookingRepository = new BookingRepository();
        const result = await bookingRepository.findUsersPastBookingRequest({
          user,
          params
        });
        //console.log("User Booking Requets", result);
        if (result) {
          return {
            success: true,
            message: "booking request for this user",
            data: result
          };
        } else {
          return {
            success: false,
            message: "Could not find any booking request for this user",
            data: null
          };
        }
      } else {
        return { success: true, message: "User login is requred" };
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
      const data = await this.userRepository.findOneUser({ _id: id });
      let { keyName, path } = body;
      let update;

      console.log("deleteImage body", body);

      if (keyName === "idProof") {
        update = {
          $set: { "documents.idProofpath": "" }
        };
      }
      if (keyName === "license") {
        update = {
          $set: {
            "documents.licensepath": ""
          }
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

      const result = await this.userRepository.updateImages({ id }, update);
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
}
