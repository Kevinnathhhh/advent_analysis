const prisma = require("../db/index");

const findAdmins = async () => {
    const admins = await prisma.admin.findMany();

    return admins;
};

const findAdminById = async (adminId) => {
    const admin = await prisma.admin.findUnique({
      where: {
        admin_id: adminId,
      },
    });
    return admin;
}

const insertAdmin = async (newAdmin)  => {
    const admin = await prisma.admin.create({
        data: {
            username: newAdmin.username,
            password: newAdmin.password,
        },
    });
    return admin;
};

const deleteAdminById = async (adminId) => {
    await prisma.admin.delete({
        where: {
            admin_id:  adminId,
        },
    });
};

const updateAdmin = async (adminId, dataAdmin) => {
    const admin = await prisma.admin.update({
        where: {
            admin_id: adminId,
        },
        data: {
            username: dataAdmin.username,
            password: dataAdmin.password,
        },
    });
    return admin;
};

module.exports = {
    findAdmins,
    findAdminById,
    insertAdmin,
    deleteAdminById,
    updateAdmin,
};