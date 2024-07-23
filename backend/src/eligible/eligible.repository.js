const prisma = require("../db/index")

const findStudents = async () => {
    const students = await prisma.student_Eligible.findMany()

    return students
}

const findStudentById = async (studentId) => {
    const student = await prisma.student_Eligible.findFirst({
        where: {
            student_eligible_id: studentId
        }
    })
    return student
}

const insertStudent = async (newStudent) => {
    try {
        const student = await prisma.student_Eligible.create({
            data: {
                name: newStudent.name,
                nis: newStudent.nis,
                jurusan: newStudent.jurusan,
                nilaisemester1: newStudent.nilaisemester1,
                nilaisemester2: newStudent.nilaisemester2,
                nilaisemester3: newStudent.nilaisemester3,
                nilaisemester4: newStudent.nilaisemester4,
                nilaisemester5: newStudent.nilaisemester5,
            }
        });
        return student;
    } catch (error) {
        console.error('Error inserting student:', error);
        throw error; // Propagate the error to be handled by the controller
    }
};


const deleteStudentById = async (studentId) => {
    await prisma.student_Eligible.delete({
        where:{
            student_eligible_id:studentId
        },
    });
};

const updateStudent = async (studentId,dataStudent) => {
    const student = await prisma.student_Eligible.update ({
        where: {
            student_eligible_id:studentId,
        },
        data : {
            name: dataStudent.name,
            nis: dataStudent.nis,
            nilaisemester1: dataStudent.nilaisemester1,
            nilaisemester2: dataStudent.nilaisemester2,
            nilaisemester3: dataStudent.nilaisemester3,
            nilaisemester4: dataStudent.nilaisemester4,
            nilaisemester5: dataStudent.nilaisemester5,
            approval: dataStudent.approval,
            jurusan: dataStudent.jurusan,
            
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