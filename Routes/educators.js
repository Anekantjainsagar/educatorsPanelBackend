const express = require("express");
const multer = require("multer");
const csvtojson = require("csvtojson");
const educators = express.Router();
const sgMail = require("@sendgrid/mail");
const Educator = require("../Model/educatorSchema");
var nodemailer = require("nodemailer");

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

educators.put("/updateEducator", async (req, res) => {
  const {
    id,
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
  } = req.body;

  Educator.updateOne(
    { _id: id },
    {
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
    }
  ).then((response) => {
    res.send(response);
  });
});

educators.delete("/deleteEducator", (req, res) => {
  const { id } = req.body;
  Educator.deleteOne({ _id: id }).then((response) => {
    res.send(response);
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

educators.get("/downloadFormat", (req, res) => {
  res.download("./Routes/uploads/EducatorPanel.csv");
});

educators.get("/sendMail", async (req, res) => {
  const users = await Educator.find();

  var mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "anekantjainsagar@gmail.com",
      pass: "wxnebcghxlgplaiu",
    },
  });

  const month = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "JUNE",
    "JULY",
    "AUG",
    "SEPT",
    "OCT",
    "NOV",
    "DEC",
  ];

  users.map(async (e) => {
    const result = await mail.sendMail({
      to: e.email,
      subject: `Pay Slip for the month of ${
        month[new Date().getMonth() - 2]
      } ${new Date().getFullYear()}`,
      text: `
      Dear ${e.name},
      Confident you're doing well...!
      
      Attached herewith, kindly find the detailed information regarding your compensation, acknowledging your exceptional efforts and contributions. We highly appreciate your hard work and believe in offering fair and prompt remuneration for your commitment.
      
      If you have any questions or require further clarification, please do not hesitate to reach out to educators@oll.co.
      
      Best
      Team Accounts.`,
      attachments: [
        {
          filename: "Educator Payslip.html",
          content: `<html> <head> <title></title> </head> <body style="font-family:Arial; margin: 0 20px;"><div> <img src="http://cdn.mcauto-images-production.sendgrid.net/9dce8bd65b7f8879/11bbd28e-de1d-4de6-adde-54f2812f64e6/902x902.png" width="45px" style="margin:auto; display:block;" /> <h1 style="font-size:22px; text-align:center;">OLL</h1> </div> <h4 style="font-size:17px;">Date : ${
            month[new Date().getMonth() - 2]
          } ${new Date().getFullYear()}<span style="font-weight:500"></span></h4> <table style="padding:15px 10px; width:100%; font-size:16.5px; border:1px solid black;"> <tr> <td>${
            e.name
          }</td> <td>${e.bankName}</td> </tr> <tr> <td>${e.email}</td> <td>${
            e.accountNo
          }</td> </tr> <tr> <td>${e.address}</td> <td>${
            e.ifscCode
          }</td> </tr> </div> <table style="width:100%; text-align:center; font-size:14px; margin-top:20px;" border=1> <tr style="color:white;"> <th style="background-color:red; padding:6px 0;">Earning</th> <th style="background-color:red; padding:6px 0;">Amount</th> <th style="background-color:gray; padding:6px 0;">Deduction</th> <th style="background-color:gray; padding:6px 0;">Amount</th> </tr> <tr style="color:black;"> <td style="padding:6px 0; font-weight:550;">Basic Pay</td> <td style="padding:6px 0;">Rs. ${
            e.basicPay
          }</td> <td style="padding:6px 0; font-weight:550;">TDS</td> <td style="padding:6px 0;">Rs. ${
            e.tds
          }</td> </tr> <tr style="color:black;"> <td style="padding:6px 0; font-weight:550;">Incentive</td> <td style="padding:6px 0;">Rs. ${
            e.incentive
          }</td> <td style="padding:6px 0; font-weight:550;">Penalities</td> <td style="padding:6px 0;">Rs. ${
            e.penalties
          }</td> </tr> <tr style="color:black;"> <td style="padding:6px 0; font-weight:550;">Travel Allowance</td> <td style="padding:6px 0;">Rs. ${
            e.travelAllowance
          }</td> </tr> <tr style="color:black;"> <td style="padding:6px 0; font-weight:550;">Other Allowance</td> <td style="padding:6px 0;">Rs. ${
            e.otherAllowance
          }</td> </tr> <tr style="color:black;"> <td style="padding:6px 0; font-weight:550;">Gross Earning</td> <td style="padding:6px 0;">Rs. ${
            e.grossEarning
          }</td> <td style="padding:6px 0; font-weight:550;">Gross Deduction</td> <td style="padding:6px 0;">Rs. ${
            e.grossDeduction
          }</td> </tr> </table> <h1 style="font-size:17px; margin-top:20px;">Net Pay : Rs. ${
            e.netPay
          }</h1> <p style="font-size:16px;">Sincerely,</p> <h3 style="font-size:16px;">Clone Futura Live Solutions Pvt Ltd.</h3> <img src="http://cdn.mcauto-images-production.sendgrid.net/9dce8bd65b7f8879/3da687cd-c0ae-4bd3-a2ee-e78b2f59cf98/178x82.jpg" width="150px" /> <h3 style="font-size:16px;">Koshika Mahajan</h3> </body> </html>`,
        },
      ],
    });
    res.send(result);
  });
});

module.exports = educators;
