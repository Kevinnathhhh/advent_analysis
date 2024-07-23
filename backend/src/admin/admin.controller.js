const express = require("express");
const router = express.Router();
const prisma = require("../db/index");
const { authenticateJWT } = require("../auth/auth.middleware");

const {
    getAllAdmins,
    getAdminById,
    addDataAdmin,
    deleteAdmin,
    updateAdminById,
} = require("./admin.service");

router.get("/", authenticateJWT, async (req, res) => {
    const admins = await getAllAdmins();

    res.send(admins);
});

router.get("/:id", authenticateJWT, async (req, res) => {
    const id = parseInt(req.params.id);
    const admin = await getAdminById(id);

    if (!admin) {
        return res.send("Data Admin Tidak Ditemukan");
    }
    res.send(admin);
});

router.post("/", authenticateJWT, async (req, res) => {
    try {
        const newAdmin = req.body;
        if(
            !(
                newAdmin.username &&
                newAdmin.password 
            )
        ){
            return res.status(400).send("Lengkapi Data Admin");
        }
        const admin = await addDataAdmin(newAdmin);
        
        res.send({
            data: admin,
            message: "Data Admin Berhasil Ditambahkan",
        });        
    } catch (error) {
        res.status(500).send({
            message: "Server Error",
            error: error.message,
        })
    }

})

router.delete("/:id", authenticateJWT, async (req, res) => {
    const admin_id = parseInt(req.params.id);
    
    await deleteAdmin(admin_id);

    res.send("Data Admin Berhasil Dihapus");
});

router.patch("/:id", authenticateJWT, async (req, res) => {
    const admin_id = parseInt(req.params.id);
    const dataAdmin = req.body;

    const admin = await updateAdminById(admin_id, dataAdmin);

    res.send({
        data: admin,
        message: "Data Admin Berhasil Diupdate",
    });
});

module.exports = router;