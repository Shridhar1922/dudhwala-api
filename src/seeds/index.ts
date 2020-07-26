const mongoose = require("mongoose");
import "../models";
import * as config from "../config/index";
mongoose.Promise = require("bluebird");

var fs = require("fs");

mongoose.connect(config.MONGO_URL).then(async () => {
  try {
    console.log("Connected to mongo");
    const files = fs.readdirSync(__dirname);
    /** Import all files for defining models */
    const promises = files.map(function(fileName) {
      const seederName = fileName.replace(".ts", "");
      if (seederName !== "index") {
        try {
          const Model = mongoose.model(seederName.toLowerCase());

          if (Model) {
            const result = Model.create(require(`./${fileName}`)["default"]);
            console.log("\x1b[32m", "Seed successfull " + seederName);
            return result;
          }
          console.log("\x1b[31m", "oops, no model found!");
        } catch (e) {
          console.log("\x1b[31m", "Could not seed ", e.message);
        }
      }
    });

    const result = await Promise.all(promises);
    mongoose.connection.close();
    console.log("\x1b[32m", "Seeding completed", "\x1b[0m");
    process.exit(0);
  } catch (e) {
    console.log("Seeders could not be added ", e);
    mongoose.connection.close();
    process.exit(0);
  } finally {
    console.log("reached to finally");
    // mongoose.connection.close();
    console.log("\x1b[32m", "Seeding completed");
    // process.exit(0);
  }
});

const Seeders = {};

// User.collection.drop();

// User.create([{
//   username: 'dan123',
//   email: 'dan@dan.com',
//   postcode: 'SE270JF',
//   password: '123'
// }, {
//   username: 'ben123',
//   email: 'ben@ben.com',
//   postcode: 'SE191SB',
//   password: '123'
// }])
// .then(user => {
//   console.log(`${user.length} users created`);
// })
// .catch((err) => {
//   console.log(err);
// })
// .finally(() => {
//   mongoose.connection.close();
// });
