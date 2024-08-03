const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require("../db/index");
const { authenticateJWT, authorizeRoles } = require("../auth/auth.middleware");

// Konfigurasi multer
const upload = multer({ dest: 'uploads/' });

const {
    getAllStudents,
    getStudentById,
    addDataStudent,
    deleteStudent,
    updateStudentById, 
    getAllResults,
    processExcelData,
} = require("./eligible.service");

// Endpoint untuk mendapatkan semua data siswa
router.get("/", authenticateJWT, authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    const students = await getAllStudents();
    return res.send(students);
});

// Endpoint untuk mendapatkan data siswa berdasarkan ID
router.get("/student/:id", authenticateJWT, authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    const studentId = parseInt(req.params.id);
    const student = await getStudentById(studentId);

    if (!student) {
        return res.status(404).send("Tidak ada");
    }
    res.send(student);
});

// Endpoint untuk mendapatkan hasil
router.get("/results", authenticateJWT, authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    const students = await getAllResults();
    return res.send(students);
});

// Endpoint untuk menambahkan data siswa
router.post("/students", authenticateJWT, authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    try {
        const newStudent = req.body;
        if (
            !(
                newStudent.name &&
                newStudent.nis &&
                newStudent.nilaisemester1 &&
                newStudent.nilaisemester2 &&
                newStudent.nilaisemester3 &&
                newStudent.nilaisemester4 &&
                newStudent.nilaisemester5
            )
        ) {
            return res.status(400).send("Lengkapi Data student");
        }
        const student = await addDataStudent(newStudent);
        res.send({
            data: student,
            message: "Data student berhasil ditambahkan"
        });
    } catch (error) {
        res.status(500).send({
            message: "Server Error",
            error: error.message
        });
    }
});

// Endpoint untuk menghapus data siswa
router.delete("/student/:id", authenticateJWT, authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    const student_id = parseInt(req.params.id);
    await deleteStudent(student_id);
    res.send("Data student berhasil dihapus");
});

// Endpoint untuk memperbarui data siswa
router.patch("/student/:id", authenticateJWT, authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    const student_id = parseInt(req.params.id);
    const dataStudent = req.body;
    const student = await updateStudentById(student_id, dataStudent);
    res.send({
        data: student,
        message: "Data student berhasil diupdate"
    });
});

// Endpoint untuk mengunggah file Excel
router.post('/upload', authenticateJWT, authorizeRoles("Admin", "Headmaster"), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Proses file Excel yang diunggah
        await processExcelData(req.file.path);

        // Hapus file setelah diproses
        fs.unlinkSync(req.file.path);

        res.send('File uploaded and processed successfully.');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/eligibles/upload', authorizeRoles("Admin", "Headmaster"), upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
  
      // Process the data and insert into the database
      for (const row of data) {
        await prisma.student_Eligible.create({
          data: {
            name: row.name,
            nis: row.nis,
            jurusan: row['jurusan'] || '', // Normalize column names if necessary
            nilaisemester1: row['nilaisemester1'] || 0,
            nilaisemester2: row['nilaisemester2'] || 0,
            nilaisemester3: row['nilaisemester3'] || 0,
            nilaisemester4: row['nilaisemester4'] || 0,
            nilaisemester5: row['nilaisemester5'] || 0,
          }
        });
      }
  
      res.status(200).json({ message: 'File processed successfully' });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ error: 'Error processing file' });
    }
  });

  router.delete('/students', authorizeRoles("Admin", "Headmaster"), async (req, res) => {
    try {
      await prisma.student_Eligible.deleteMany(); // Menghapus semua siswa
      res.status(200).json({ message: 'All students deleted successfully' });
    } catch (error) {
      console.error("Error deleting all students:", error);
      res.status(500).json({ error: 'An error occurred while deleting students' });
    }
  });


module.exports = router;
