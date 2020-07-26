import * as mongoose from "mongoose";

export class SupplierRepository {
  private collection = "user"; //saving suppliers into users colllection
  private model: any;
  private defaultSearchColumn = "username";

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  query = {
    isDeleted: false
  };

  /**
   * Store supplier into DB
   * @param data Object with user details
   */
  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const User = new this.model(data);
        console.log("Supplier is", User);
        const user = await User.save();
        console.log("stored", user);
        resolve(JSON.parse(JSON.stringify(user)));
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Find Supplier by email
   * @param email
   */
  findByEmail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        if (email && typeof email === "string") {
          const user: mongoose.Schematype = await this.model
            .findOne({ email })
            .populate("role", "-permissions")
            .exec();
          if (user) {
            return resolve(user.toObject());
          }
          reject({ message: "Could not find supplier with this email" });
        } else {
          reject("Email ID invalid");
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Approve booking request by supplier call update query */
  async update(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        let update = {};

        update["$set"] = data;
        const bookingRequestBySupplier = await this.model.findOneAndUpdate(
          condition,
          update,
          {
            new: true
          }
        );

        console.log(
          "bookingRequestBySupplier........",
          bookingRequestBySupplier
        );
        resolve(JSON.parse(JSON.stringify(bookingRequestBySupplier)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find supplier by ID
   * @param id supplier object id
   */
  // findOne(id) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const angle = await this.model.findById(id).exec();
  //       if (angle) {
  //         return resolve(JSON.parse(JSON.stringify(angle)));
  //       } else {
  //         resolve(false);
  //       }
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

 
}
