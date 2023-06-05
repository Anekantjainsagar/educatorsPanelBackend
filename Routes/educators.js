const express = require("express");
const multer = require("multer");

const educators = express.Router();
const Educator = require("../Model/educatorSchema");

var storeExcel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/uploads");
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

educators.delete("/deleteUser", (req, res) => {
  const { id } = req.body;
  Educator.deleteOne({ _id: id }, (err, data) => {
    res.send(data);
  });
});

educators.post(
  "/uploadEducator",
  uploadExcel.single("file"),
  async (req, res) => {
    const filePath = __dirname + "/uploads/" + req.file.filename;
    var arrayToInsert = [];
    csvtojson()
      .fromFile(filePath)
      .then((source) => {
        for (var i = 0; i < source.length; i++) {
          if (source[i]["name"]?.length > 0) {
            var singleRow = {
              name: source[i]["name"],
              email: source[i]["email"],
              address: source[i]["address"],
              bankName: source[i]["bankName"],
              bankBranch: source[i]["bankBranch"],
              accountNo: source[i]["accountNo"],
              ifscCode: source[i]["ifscCode"],
              basicPay: source[i]["basicPay"],
              travelAllowance: source[i]["travelAllowance"],
              otherAllowance: source[i]["otherAllowance"],
              grossEarning: source[i]["grossEarning"],
              tds: source[i]["tds"],
              penalties: source[i]["penalties"],
              grossDeduction: source[i]["grossDeduction"],
              netPay: source[i]["netPay"],
              payslips: source[i]["payslips"],
            };
          }
          arrayToInsert.push(singleRow);
        }
        console.log(arrayToInsert);
        Educator.insertMany(arrayToInsert, (err, result) => {
          if (err) console.log(err);
          if (result) {
            res.send(result);
          }
        });
      });
  }
);

module.exports = educators;
