const prisma = require("../db/index");

const {
    findAdmins,
    findAdminById,
    insertAdmin,
    deleteAdminById,
    updateAdmin,
} = require("./admin.repository");

const getAllAdmins = async () => {
    const dataAdmin = await findAdmins();

    return dataAdmin;
}

const getAdminById = async (admin_id) => {
    const dataAdmin = await findAdminById(admin_id);

    return dataAdmin;
};

const addDataAdmin = async (newAdmin) => {
    const admin = await insertAdmin(newAdmin);

    return admin;
};

const deleteAdmin = async (admin_id) => {
    await getAdminById(admin_id);

    await deleteAdminById(admin_id);
};

const updateAdminById = async (admin_id, dataAdmin) => {
    await getAdminById(admin_id);

    const admin = await updateAdmin(admin_id,dataAdmin);
    return admin;
};

module.exports = {
    getAllAdmins,
    getAdminById,
    addDataAdmin,
    deleteAdmin,
    updateAdminById,
};