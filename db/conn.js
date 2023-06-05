const mongoose = require("mongoose");

const connectToDb = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to db successfully...");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectToDb;
