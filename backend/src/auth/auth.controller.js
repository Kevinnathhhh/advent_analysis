const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password} = req.body;

        if (!username || !password){
            return res.status(400).send("Lengkapi Data User");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            data: newUser,
            message: "User berhasil didaftarkan",
        });

    } catch (error) {
        console.error("Error", error);
        res.status(500).send({
            message: "Server Error",
            error: error.message,
        })
        
    }
});

router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await prisma.admin.findUnique({
            where: {username}
        })

        if (!user){
            return res.status(401).json({error: "Invalid username or password"});
        }

        const validPassword =  await bcrypt.compare(password, user.password);
        if(!validPassword){
            return res.status(401).json({error: "Invalid username or password"});
        }
        const token = jwt.sign(
            { id: user.admin_id},
            process.env.JWT_SECRET,
            { expiresIn: "1h"}
        );

        res.json({token});

    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

module.exports = router;