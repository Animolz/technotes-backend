const mongoose = require("mongoose");

const connectDb = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDb;
