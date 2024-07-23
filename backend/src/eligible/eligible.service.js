const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const prisma = require("../db/index");
const {
    findStudents,
    findStudentById,
    insertStudent,
    deleteStudentById,
    updateStudent,
} = require("./eligible.repository");


const getAllStudents = async () => {
    const datastudent = await findStudents();

    return datastudent;
};

const getStudentById = async (student_id) =>{
    const datastudent = await findStudentById(student_id);

    return datastudent;
};

const addDataStudent = async (newStudent) => {
    const student = await insertStudent(newStudent)

    return student
};

const deleteStudent = async (student_id) => {
    await getStudentById (student_id);

    await deleteStudentById (student_id);
};

const updateStudentById = async (student_id,dataStudent) => {
    await getStudentById(student_id);

    const student = await updateStudent(student_id,dataStudent);

    return student;
};

const getAverageScore = (student) => {
    const { nilaisemester1, nilaisemester2, nilaisemester3, nilaisemester4, nilaisemester5 } = student;
    const total = nilaisemester1 + nilaisemester2 + nilaisemester3 + nilaisemester4 + nilaisemester5;
    return total / 5;
  };
  
  const determineEligibility = (nilaismt2, nilaismt3) => {
    return nilaismt2 > 90.971 || nilaismt3 > 89.618 ? 'Eligible' : 'Tidak Eligible';
  };
  
  const getAllResults = async () => {
    const students = await prisma.student_Eligible.findMany();
  
    return students.map((student) => {
      const nilaismt2 = student.nilaisemester2 || 0;
      const nilaismt3 = student.nilaisemester3 || 0;
  
      const eligibility = determineEligibility(nilaismt2, nilaismt3);
  
      return {
        ...student,
        averageScore: getAverageScore(student),
        eligible: eligibility
      };
    });
  };

  const processExcelData = async (filePath) => {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log('Data from Excel:', data); 

        for (const row of data) {
            // Pastikan semua field yang diperlukan ada
            const {
                name,
                nis,
                jurusan,
                nilaisemester1,
                nilaisemester2,
                nilaisemester3,
                nilaisemester4,
                nilaisemester5
            } = row;

            if (!name || !nis || !jurusan || !nilaisemester1 || !nilaisemester2 || !nilaisemester3 || !nilaisemester4 || !nilaisemester5) {
                throw new Error('Missing required fields');
            }

            await insertStudent({
                name,
                nis,
                jurusan,
                nilaisemester1,
                nilaisemester2,
                nilaisemester3,
                nilaisemester4,
                nilaisemester5
            });
        }
    } catch (error) {
        console.error('Error processing Excel file:', error);
        throw error; // Propagate the error to be handled by the controller
    }
};
module.exports = {
    getAllStudents,
    getStudentById,
    addDataStudent,
    deleteStudent,
    updateStudentById,
    getAllResults,
    processExcelData,
};