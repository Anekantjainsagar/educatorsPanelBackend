const express = require("express");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginRoute = express.Router();
var salt = bcrypt.genSaltSync(10);

const LoginUser = require("../Model/loginSchema");

loginRoute.post("/sign-up", async (req, res) => {
  let { name, email, password } = req.body;
  password = await bcrypt.hash(password, salt);
  email = email?.toLowerCase();

  const isUnique = await LoginUser.find({ email });
  console.log(isUnique);
  if (isUnique.length == 0) {
    const user = new LoginUser({ name, email, password });
    user
      .save()
      .then((result) => {
        res.send({ name: result?.name });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.send("Already Exists");
  }
});

loginRoute.post("/sign-in", async (req, res) => {
  let { email, password } = req.body;
  email = email?.toLowerCase();

  let isUnique = await LoginUser.find({ email });
  isUnique = isUnique[0];
  if (isUnique) {
    const matched = await bcrypt.compare(password, isUnique?.password);
    if (matched) {
      const jwtToken = jwt.sign(
        {
          user: isUnique._id,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );
      res.status(200).send({ jwtToken });
    } else {
      res.send("Invalid credentials");
    }
  } else {
    res.send("User doesn't exists");
  }
});

loginRoute.post("/checkToken", async (req, res) => {
  const decode = jwt.verify(req.body.token, process.env.SECRET_KEY);
  const user = await LoginUser.findById(decode.user);
  if (user) {
    res.send({ name: user?.name, _id: user?._id });
  } else {
    res.send("Some Error Occured");
  }
});

module.exports = loginRoute;
