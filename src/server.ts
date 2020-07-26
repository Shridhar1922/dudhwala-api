import { useExpressServer } from "routing-controllers";
import { Action } from "routing-controllers";
import { authorizationChecker } from "./middlewares/auth";
import authService from "./libs/authService";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import * as path from "path";
import "reflect-metadata";
import * as express from "express";
import { UserRepository } from "./repositories/userRepositories";
import * as bodyParser from "body-parser";
const Modules = require("./seeds/Module");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

// APP
import * as config from "./config/index";

import "./models";

// SESSION STORE FOR CART
// const store = new MongoDBStore({
//   uri: config.MONGO_URL,
//   collection: "sessions"
// });

const app = express();

// Socket.io
const http = require("http").Server(app);
const io = require("socket.io")(http);
var sendNotification = notification => {};

io.set("origins", "*:*");

// app.use(
//   session({
//     secret: config.SESSION_KEY,
//     resave: false,
//     saveUninitialized: true,
//     store: store,
//     unset: "destroy",
//     name: "YPS_CRT"
//   })
// );

io.on(
  "connection",
  function(socket) {
    sendNotification = notification => {
      console.log("notification...", notification);
      socket.emit("news", notification);
    };

    app.set("sendNotification", sendNotification);
    socket.on("my other event", function(data) {
      console.log("data...", data);
    });
  },
  { reconnect: true }
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
  })
);

const controllers =
  process.env.NODE_ENV === "production"
    ? [__dirname + "/controllers/*.js", __dirname + "/controllers/front/*.js"]
    : [__dirname + "/controllers/*.ts", __dirname + "/controllers/front/*.ts"];
const middlewares =
  process.env.NODE_ENV === "production"
    ? [__dirname + "/middlewares/globals/*.js"]
    : [__dirname + "/middlewares/globals/*.ts"];
useExpressServer(app, {
  cors: true,
  routePrefix: "/api",
  controllers,
  middlewares,
  authorizationChecker,

  currentUserChecker: async (action: Action) => {
    // here you can use request/response objects from action
    // you need to provide a user object that will be injected in controller actions
    const authHead = action.request.headers["authorization"];
    if (!authHead) {
      return null;
    }
    let token = authHead.split(" ")[1];
    if (!token) {
      return null;
    }
    console.log("\x1b[33m", "Authorizing request...", "\x1b[0m");
    let user = await authService.verifyToken(token);
    if (user) {
      const userRepository = new UserRepository();
      let userDetails = await userRepository.findByEmail(user["data"].email);
      return userDetails;
    } else {
      return null;
    }
  }
});
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "/../client/dist")));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/admin*", (req, res) => {
  res.sendFile(path.join(__dirname + "/../client/dist/index.html"));
});

mongoose.connect(config.MONGO_URL, { useNewUrlParser: true }, err => {
  if (err) {
    console.log("Could not connect to DB", err);
    process.exit(1);
  }
  /** SEED MODULES */
  if (process.env.NODE_ENV === "production") {
    console.log("Mongoose seeding modules...");
    const Model = mongoose.model("module");
    //removing
    Model.remove({}, err => {
      if (err) {
        console.log("\x1b[32m", "Could not remove records");
      }
      const result = Model.create(Modules["default"]);
      console.log("\x1b[32m", "Seed successfull ");
    });
  }
  /** END SEED */

  console.log("\x1b[32m", "Mongoose connected..");
  console.log("\x1b[33m", "Starting server..");
  http.listen(config.PORT, config.HOST, () => {
    console.log("\x1b[32m", `Server started ${config.PORT}`, "\x1b[0m");
  });
});
