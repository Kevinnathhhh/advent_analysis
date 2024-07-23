const express = require("express");
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const adminController = require("./admin/admin.controller");
const packageController = require("./package/package.controller");
const eligibleController = require("./eligible/eligible.controller");
const authController = require("./auth/auth.controller");
const { authenticateJWT } = require("./auth/auth.middleware");

const prisma = new PrismaClient();
const app = express();

dotenv.config();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json())

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.get("/api", (req, res) => {
    res.send("Kevin Nathaniel");
});

app.use("/auth", authController);
app.use(authenticateJWT);
app.use("/admins",authenticateJWT, adminController);
app.use("/packages", authenticateJWT, packageController);
app.use("/eligibles", authenticateJWT, eligibleController);


app.listen(PORT, () =>{
    console.log("Express API running in port: " + PORT);
});