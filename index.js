require("dotenv").config();
const express = require("express");
const connectDb = require("./config/dbConn");
const mongoose = require("mongoose");
const cookiesParser = require("cookie-parser");
const cors = require("cors");

//middlewares import
const { logger, logEvent } = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

//configs import
const corsOptions = require("./config/corsOptions");

//routes import
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");

//express declaration
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3500;

//log request
app.use(logger);

//cors
app.use(cors(corsOptions));

//json parser middleware
app.use(express.json());

app.use(cookiesParser());

//public folder middleware
app.use("/", express.static(path.join(__dirname, "public")));

//use routes
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);
app.use("/auth", authRoutes);

//log error
app.use(errorHandler);

connectDb();

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvent(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
