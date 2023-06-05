require("dotenv").config();

const express = require("express");
const app = express();
// MongoDb Connect
const connectToDb = require("./db/conn");
// Different Routes
const loginRoute = require("./Routes/login");
const educators = require("./Routes/educators");

connectToDb();

app.use(express.json());
app.use("/login", loginRoute);
app.use("/educator", educators);

app.listen(process.env.PORT, () => {
  console.log(`Educator panel is listening on port : ${process.env.PORT}`);
});
