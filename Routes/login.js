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
  if (!isUnique) {
    const user = new LoginUser({ name, email, password });
    user
      .save()
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.send("Already Exists");
  }
});

loginRoute.get("/sign-in", async (req, res) => {
  let { email, password } = req.body;
  email = email?.toLowerCase();

  const isUnique = await LoginUser.find({ email });
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

module.exports = loginRoute;
