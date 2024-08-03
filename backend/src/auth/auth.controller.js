const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).send("Lengkapi Data User");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role === 'Admin') {
            newUser = await prisma.admin.create({
                data: {
                    username,
                    password: hashedPassword,
                },
            });
        } else if (role === 'Headmaster') {
            newUser = await prisma.headmaster.create({
                data: {
                    username,
                    password: hashedPassword,
                },
            });
        } else {
            return res.status(400).send("Peran tidak valid");
        }

        res.status(201).json({
            data: newUser,
            message: "User berhasil didaftarkan",
        });

    } catch (error) {
        console.error("Error", error);
        res.status(500).send({
            message: "Server Error",
            error: error.message,
        });
    }
});


router.post("/login", async (req, res) => {
    const { username, password, role } = req.body;

    try {
        let user;
        if (role === 'Admin') {
            user = await prisma.admin.findUnique({
                where: { username },
            });
        } else if (role === 'Headmaster') {
            user = await prisma.headmaster.findUnique({
                where: { username },
            });
        } else {
            return res.status(400).json({ error: "Peran tidak valid" });
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: role === 'Admin' ? user.admin_id : user.headmaster_id, role: role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
