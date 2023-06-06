const express = require("express");
const multer = require("multer");
const csvtojson = require("csvtojson");
const educators = express.Router();
const Educator = require("../Model/educatorSchema");

var storeExcel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Routes/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

var uploadExcel = multer({ storage: storeExcel });

educators.get("/getEducators", async (req, res) => {
  var { page, size, search } = req.query;

  if (!page) {
    page = 1;
  }
  if (!size) {
    size = 10;
  }

  if (!search) {
    search = "";
  }

  const limit = parseInt(size);

  const noOfEducators = await Educator.find({
    name: { $regex: search, $options: "i" },
  });
  const educators = await Educator.find({
    name: { $regex: search, $options: "i" },
  })
    .sort({ stage: 1, inqDate: -1 })
    .limit(limit);
  res.send({
    page,
    size,
    educators: educators,
    noOfEducators: noOfEducators.length,
  });
});

educators.get("/getAllEducators", async (req, res) => {
  const educators = await Educator.find();
  res.send({ educators });
});

educators.post("/addEducator", async (req, res) => {
  const {
    name,
    email,
    address,
    bankName,
    accountNo,
    bankBranch,
    ifscCode,
    basicPay,
    incentive,
    travelAllowance,
    otherAllowance,
    grossEarning,
    tds,
    penalties,
    grossDeduction,
    netPay,
    emailSent,
    payslips,
  } = req.body;

  const educators = new Educator({
    name,
    email,
    address,
    bankName,
    accountNo,
    bankBranch,
    ifscCode,
    basicPay,
    incentive,
    travelAllowance,
    otherAllowance,
    grossEarning,
    tds,
    penalties,
    grossDeduction,
    netPay,
    emailSent,
    payslips,
  });
  educators
    .save()
    .then(() => {
      res.status(200).json({ success: true, educators });
    })
    .catch((err) => {
      console.log(err);
    });
});

educators.delete("/deleteEducator", (req, res) => {
  const { id } = req.body;
  Educator.deleteOne({ _id: id }, (err, data) => {
    res.send(data);
  });
});

educators.post(
  "/uploadEducators",
  uploadExcel.single("file"),
  async (req, res) => {
    const filePath = __dirname + "/uploads/" + req.file.filename;
    var arrayToInsert = [];
    csvtojson()
      .fromFile(filePath)
      .then((source) => {
        for (var i = 0; i < source.length; i++) {
          if (source[i]["Name"]?.length > 0) {
            var singleRow = {
              name: source[i]["Name"],
              email: source[i]["Email"],
              address: source[i]["Address"],
              bankName: source[i]["Bank Name"],
              bankBranch: source[i]["Bank Branch"],
              accountNo: source[i]["Account No"],
              ifscCode: source[i]["IFSC Code"],
              basicPay: source[i]["Basic Pay"],
              travelAllowance: source[i]["Travel Allowance"],
              otherAllowance: source[i]["Other Allowance"],
              grossEarning: source[i]["Gross Earning"],
              tds: source[i]["TDS"],
              penalties: source[i]["Penalties"],
              grossDeduction: source[i]["Gross Deduction"],
              netPay: source[i]["Net Pay"],
              payslips: source[i]["Payslips"],
              incentive: source[i]["Incentive"],
            };
          }
          arrayToInsert.push(singleRow);
        }
        console.log(arrayToInsert);
        Educator.insertMany(arrayToInsert).then(() => {
          res.send("Added Successfully");
        });
      });
  }
);

module.exports = educators;
