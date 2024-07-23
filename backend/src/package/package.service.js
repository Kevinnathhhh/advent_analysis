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
} = require("./package.repository");


const getStudentById = async (student_id) => {
    const dataStudent = await findStudentById(student_id);
    
    return dataStudent;
};

const addDataStudent = async (newStudent) => {
    const student = await insertStudent(newStudent);
    
    return student;
};

const deleteStudent = async (student_id) => {
    await getStudentById(student_id);
    
    await deleteStudentById(student_id);
};

const updateStudentById = async (student_id, dataStudent) => {
    await getStudentById(student_id);
    
    const student = await updateStudent(student_id,dataStudent);
    return student;
};

const getAllStudents = async () => {
    const dataStudent = await findStudents();

    return dataStudent;
}

const calculateRecommendations = async () => {
    try {
        const students = await findStudents();

        const nilaiKelompok1 = [
            [63, 88, 72, 92],
            [88, 67, 92, 73],
            [71, 94, 88, 69],
            [90, 72, 66, 88],
        ];

        const nilaiKelompok2 = [
            [64, 90, 74, 80],
            [81, 72, 92, 68],
            [76, 63, 83, 92],
            [93, 85, 62, 76],
        ];

        const nilaiKelompok3 = [
            [65, 91, 76, 83],
            [86, 74, 91, 67],
            [79, 65, 82, 92],
            [93, 88, 62, 77],
        ];

        const kelompok1 = ["fisika", "ekonomi", "geografi", "sosiologi"];
        const kelompok2 = ["matematika", "ekonomi", "informatika", "sosiologi"];
        const kelompok3 = ["biologi", "matematika", "kimia", "fisika"];

        const hitungJarakKelompok = (siswa, nilaiKelompok, kelompok) => {
            return Math.sqrt(
                kelompok.reduce(
                    (sum, mataPelajaran, index) =>
                        sum + Math.pow(siswa[mataPelajaran] - nilaiKelompok[index], 2),
                    0
                )
            );
        };

        students.forEach((s) => {
            const c1K1 = hitungJarakKelompok(s, nilaiKelompok1[0], kelompok1);
            const c2K1 = hitungJarakKelompok(s, nilaiKelompok1[1], kelompok1);
            const c3K1 = hitungJarakKelompok(s, nilaiKelompok1[2], kelompok1);
            const c4K1 = hitungJarakKelompok(s, nilaiKelompok1[3], kelompok1);

            const c1K2 = hitungJarakKelompok(s, nilaiKelompok2[0], kelompok2);
            const c2K2 = hitungJarakKelompok(s, nilaiKelompok2[1], kelompok2);
            const c3K2 = hitungJarakKelompok(s, nilaiKelompok2[2], kelompok2);
            const c4K2 = hitungJarakKelompok(s, nilaiKelompok2[3], kelompok2);

            const c1K3 = hitungJarakKelompok(s, nilaiKelompok3[0], kelompok3);
            const c2K3 = hitungJarakKelompok(s, nilaiKelompok3[1], kelompok3);
            const c3K3 = hitungJarakKelompok(s, nilaiKelompok3[2], kelompok3);
            const c4K3 = hitungJarakKelompok(s, nilaiKelompok3[3], kelompok3);

            const nilaiCTerbaikK1 = Math.min(c1K1, c2K1, c3K1, c4K1);
            const nilaiCTerbaikK2 = Math.min(c1K2, c2K2, c3K2, c4K2);
            const nilaiCTerbaikK3 = Math.min(c1K3, c2K3, c3K3, c4K3);

            s.jarakKelompok1 = [c1K1, c2K1, c3K1, c4K1];
            s.jarakKelompok2 = [c1K2, c2K2, c3K2, c4K2];
            s.jarakKelompok3 = [c1K3, c2K3, c3K3, c4K3];

            s.cTerbaikK1 = nilaiCTerbaikK1 === c1K1 ? "SR" :
                nilaiCTerbaikK1 === c2K1 ? "R" :
                nilaiCTerbaikK1 === c3K1 ? "TR" : "STR";

            s.cTerbaikK2 = nilaiCTerbaikK2 === c1K2 ? "SR" :
                nilaiCTerbaikK2 === c2K2 ? "R" :
                nilaiCTerbaikK2 === c3K2 ? "TR" : "STR";

            s.cTerbaikK3 = nilaiCTerbaikK3 === c1K3 ? "SR" :
                nilaiCTerbaikK3 === c2K3 ? "R" :
                nilaiCTerbaikK3 === c3K3 ? "TR" : "STR";
        });

        return students.map((s) => ({
            student_package_id: s.student_package_id,
            name: s.name,
            nis: s.nis,
            fisika: s.fisika,
            ekonomi: s.ekonomi,
            geografi: s.geografi,
            sosiologi: s.sosiologi,
            matematika: s.matematika,
            informatika: s.informatika,
            biologi: s.biologi,
            kimia: s.kimia,
            recommendation_teacher: s.recommendation_teacher,
            principal_approval: s.principal_approval,

            // "Nilai Kelompok 1": s.jarakKelompok1.map((n) => n.toFixed(2)),
            "paket1": s.cTerbaikK1,
            // "Nilai Kelompok 2": s.jarakKelompok2.map((n) => n.toFixed(2)),
            "paket2": s.cTerbaikK2,
            // "Nilai Kelompok 3": s.jarakKelompok3.map((n) => n.toFixed(2)),
            "paket3": s.cTerbaikK3,
        }));
    } catch (error) {
        throw new Error(error.message);
    }
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
                fisika,
                ekonomi,
                geografi,
                sosiologi,
                matematika,
                informatika,
                biologi,
                kimia,
            } = row;

            if (!name || !nis || !fisika || !ekonomi || !geografi || !sosiologi || !matematika || !informatika || !biologi || !kimia) {
                throw new Error('Missing required fields');
            }

            await insertStudent({
                name,
                nis,
                fisika,
                ekonomi,
                geografi,
                sosiologi,
                matematika,
                informatika,
                biologi,
                kimia,
            });
        }
    } catch (error) {
        console.error('Error processing Excel file:', error);
        throw error; // Propagate the error to be handled by the controller
    }
};

module.exports = {
    getAllStudents,
    // getStudentById,
    addDataStudent,
    deleteStudent,
    updateStudentById,
    calculateRecommendations,
    processExcelData,
};