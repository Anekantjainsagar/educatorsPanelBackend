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
  address: String,
  bankName: String,
  accountNo: String,
  bankBranch: String,
  ifscCode: String,
  basicPay: String,
  incentive: String,
  travelAllowance: String,
  otherAllowance: String,
  grossEarning: String,
  tds: String,
  penalties: String,
  grossDeduction: String,
  netPay: String,
  emailSent: Boolean,
  payslips: String,
});

const Educator = mongoose.model("educator", educatorSchema);
module.exports = Educator;
