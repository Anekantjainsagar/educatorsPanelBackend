const express = require("express");
const multer = require("multer");
const csvtojson = require("csvtojson");
const educators = express.Router();
const sgMail = require("@sendgrid/mail");
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

educators.get("/sendMail", async (req, res) => {
  const educators = await Educator.find();
  let emails = [];
  educators.map((e) => {
    emails.push(e.email);
  });

  sgMail.setApiKey(process.env.API_KEY);
  const msg = {
    to: [...emails], // Change to your recipient
    from: "anekantjainsagar@gmail.com", // Change to your verified sender
    subject: "Pay Slip for the month of MAY 2023",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    templateId: "d-9a86c9024bc542818ebfbdd73f5bffaf",
    dynamic_template_data: {
      PayslipReleaseDate: new Date(Date.now()).toString().slice(4, 16),
      email: "anekantjainsagar@gmail.com",
      name: "Anekant Jain",
      bankName: "SBI",
      ifscCode: "SBINXXXXX",
      accountNo: "SBINXXXXX",
      address: "XXXXXXXX",
      net: "5000",
      basicPay: "1000",
      tds: "1000",
      incentive: "1000",
      travelAllowance: "1000",
      penalties: "1000",
      otherAllowance: "1000",
      grossEarning: "1000",
      grossDeduction: "1000",
      netPay: "1000",
    },
  };

  sgMail
    .send(msg)
    .then(() => {
      res.send("Email sent");
    })
    .catch((error) => {
      console.error(error?.response?.body);
    });
});

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
    emailSent,
    payslips,
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
      emailSent,
      payslips,
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

educators.get("/downloadFormat", (req, res) => {
  res.download("./Routes/uploads/EducatorPanel.csv");
});

module.exports = educators;
