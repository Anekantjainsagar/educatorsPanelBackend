const express = require("express");
const multer = require("multer");
const csvtojson = require("csvtojson");
const educators = express.Router();
const sgMail = require("@sendgrid/mail");
const Educator = require("../Model/educatorSchema");
var nodemailer = require("nodemailer");
var fs = require("fs");
var pdf = require("html-pdf");

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
    tds,
    penalties,
  } = req.body;

  let grossDeduction = parseInt(tds) + parseInt(penalties);
  let grossEarning =
    parseInt(basicPay) +
    parseInt(incentive) +
    parseInt(travelAllowance) +
    parseInt(otherAllowance);
  let netPay = parseInt(grossEarning) - parseInt(grossDeduction);

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
    tds,
    penalties,
  } = req.body;

  let grossDeduction = parseInt(tds) + parseInt(penalties);
  let grossEarning =
    parseInt(basicPay) +
    parseInt(incentive) +
    parseInt(travelAllowance) +
    parseInt(otherAllowance);
  let netPay = parseInt(grossEarning) - parseInt(grossDeduction);

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
              tds: source[i]["TDS"],
              penalties: source[i]["Penalties"],
              incentive: source[i]["Incentive"],
              grossEarning:
                parseInt(source[i]["Basic Pay"]) +
                parseInt(source[i]["Incentive"]) +
                parseInt(source[i]["Travel Allowance"]) +
                parseInt(source[i]["Other Allowance"]),
              grossDeduction:
                parseInt(source[i]["Penalties"]) + parseInt(source[i]["TDS"]),
              netPay:
                parseInt(source[i]["Basic Pay"]) +
                parseInt(source[i]["Incentive"]) +
                parseInt(source[i]["Travel Allowance"]) +
                parseInt(source[i]["Other Allowance"]) -
                parseInt(source[i]["Penalties"]) -
                parseInt(source[i]["TDS"]),
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

educators.post("/sendMail", async (req, res) => {
  let { emailUser } = req.body;
  emailUser = JSON.parse(emailUser);

  var mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "onlinelivelearning@gmail.com",
      pass: "xsytviyupvqllfqg",
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

  emailUser.map(async (id) => {
    const e = await Educator.findById(id);
    console.log(e.email);

    const html = `<html> <head> <title></title> </head> <body style="font-family:Arial; margin: 10px 15px;"><div> <img src="http://cdn.mcauto-images-production.sendgrid.net/9dce8bd65b7f8879/11bbd28e-de1d-4de6-adde-54f2812f64e6/902x902.png" width="40px" style="margin:auto; display:block; margin-top:5px;" /> <h1 style="font-size:18px; text-align:center;">OLL</h1> </div> <h6 style="font-size:14px; text-align:center;">Payslip for the month of ${
      month[new Date().getMonth() - 2]
    } ${new Date().getFullYear()}<span style="font-weight:500"></span></h6> <table style="padding: 6px 10px; width:100%; font-size:13px; border:1px solid black;"> <tr> <td>${
      e.name
    }</td> <td>${e.bankName}</td> </tr> <tr> <td>${e.email}</td> <td>${
      e.accountNo
    }</td> </tr> <tr> <td>${e.address}</td> <td>${
      e.ifscCode
    }</td> </tr> </div> <table style="width:100%; text-align:center; font-size:12px; margin-top:15px;" border=1> <tr style="color:white;"> <th style="background-color:red; padding:6px 0;">Earning</th> <th style="background-color:red; padding:6px 0;">Amount</th> <th style="background-color:gray; padding:6px 0;">Deduction</th> <th style="background-color:gray; padding:6px 0;">Amount</th> </tr> <tr style="color:black;"> <td style="padding:6px 0; font-weight:550;">Basic Pay</td> <td style="padding:6px 0;">Rs. ${
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
    }</td> </tr> </table> <h1 style="font-size:13px; margin-top:5px;">Net Pay : Rs. ${
      e.netPay
    }</h1> <p style="font-size:12px;">Sincerely,</p> <h3 style="font-size:12px;">Clone Futura Live Solutions Pvt Ltd.</h3> <img src="http://cdn.mcauto-images-production.sendgrid.net/9dce8bd65b7f8879/3da687cd-c0ae-4bd3-a2ee-e78b2f59cf98/178x82.jpg" width="100px" /> <h3 style="font-size:12px;">Koshika Mahajan</h3><img src="http://res.cloudinary.com/dpbsogbtr/image/upload/v1689059968/agodpprxkbjoff1h3w2g.png" style="width:100%; margin-top:25px; position:absolute; bottom:0; left:0; width:100%;" /> </body> </html>`;

    await pdf
      .create(html, {
        childProcessOptions: {
          env: {
            OPENSSL_CONF: "/dev/null",
          },
        },
      })
      .toFile(`./Routes/${id}educatorPayslip.pdf`, function (err, res) {
        console.log(err);
        console.log(res);
      });

    setTimeout(async () => {
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
            filename: "Educator Payslip.pdf",
            path: `./Routes/${id}educatorPayslip.pdf`,
          },
        ],
      });
      console.log(result.accepted);
    }, 2000);
  });
  res.send("Done");
});

module.exports = educators;
