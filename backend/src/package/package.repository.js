const prisma = require("../db/index");

const findStudents = async () => {
    const students = await prisma.student_Package.findMany({
        select: {
            student_package_id: true,
            name: true,
            nis: true, 
            fisika: true,
            ekonomi: true,
            geografi: true,
            sosiologi: true,
            matematika: true,
            informatika: true,
            biologi: true,
            kimia: true,
            recommendation_teacher: true,
            principal_approval: true,
        },
    });

    return students;
};

const findStudentById = async (studentId) => {
    const student = await prisma.student_Package.findUnique({
      where: {
        student_package_id: studentId,
      },
    });
    return student;
}

const insertStudent = async (newStudent)  => {
    try {
        const student = await prisma.student_Package.create({
            data: {
                name: newStudent.name,
                nis: newStudent.nis,
                fisika: newStudent.fisika,
                ekonomi: newStudent.ekonomi,
                geografi: newStudent.geografi,
                sosiologi: newStudent.sosiologi,
                matematika: newStudent.matematika,
                informatika: newStudent.informatika,
                biologi: newStudent.biologi,
                kimia: newStudent.kimia,
            }
        });
        return student;
    } catch (error) {
        console.error('Error inserting student:', error);
        throw error; // Propagate the error to be handled by the controller
    }
};

const deleteStudentById = async (studentId) => {
    await prisma.student_Package.delete({
        where: {
            student_package_id:  studentId,
        },
    });
};

const updateStudent = async (studentId, dataStudent) => {
    const student = await prisma.student_Package.update({
        where: {
            student_package_id: studentId,
        },
        data: {
            name: dataStudent.name,
            nis: dataStudent.nis,
            fisika: dataStudent.fisika,
            ekonomi: dataStudent.ekonomi,
            geografi: dataStudent.geografi,
            sosiologi: dataStudent.sosiologi,
            matematika: dataStudent.matematika,
            informatika: dataStudent.informatika,
            biologi: dataStudent.biologi,
            kimia: dataStudent.kimia,
            recommendation_teacher: dataStudent.recommendation_teacher,
            principal_approval: dataStudent.principal_approval,
        },
    });
    return student;
};


module.exports = {
    findStudents,
    findStudentById,
    insertStudent,
    deleteStudentById,
    updateStudent,
};