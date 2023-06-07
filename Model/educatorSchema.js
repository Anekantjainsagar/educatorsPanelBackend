const mongoose = require("mongoose");

const educatorSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  bankName: {
    type: String,
    require: true,
  },
  accountNo: {
    type: String,
    require: true,
  },
  bankBranch: {
    type: String,
    require: true,
  },
  ifscCode: {
    type: String,
    require: true,
  },
  basicPay: {
    type: String,
    require: true,
  },
  incentive: {
    type: String,
    default: "0",
  },
  travelAllowance: {
    type: String,
    default: "0",
  },
  otherAllowance: {
    type: String,
    default: "0",
  },
  grossEarning: {
    type: String,
    default: "0",
  },
  tds: {
    type: String,
    default: "0",
  },
  penalties: {
    type: String,
    default: "0",
  },
  grossDeduction: {
    type: String,
    default: "0",
  },
  netPay: {
    type: String,
    require: true,
  },
});

const Educator = mongoose.model("educator", educatorSchema);
module.exports = Educator;
