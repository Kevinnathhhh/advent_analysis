const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require("../db/index");

const upload = multer({ dest: 'uploads/' });

const {
    getAllStudents,
    addDataStudent,
    deleteStudent,
    updateStudentById,
    calculateRecommendations,
    processExcelData,
} = require("./package.service");
const { authenticateJWT } = require("../auth/auth.middleware");

router.get("/", authenticateJWT,  async (req, res) => {
    try {
        const students = await getAllStudents();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


router.post("/students", authenticateJWT,  async (req, res) => {
    try {
        const newStudent = req.body;
        const requiredFields = [
            "name", "nis", "fisika", "ekonomi", "geografi",
            "sosiologi", "matematika", "informatika", "biologi", "kimia"
        ];

        for (const field of requiredFields) {
            if (!newStudent[field]) {
                return res.status(400).send("Lengkapi Data Student");
            }
        }

        const student = await addDataStudent(newStudent);

        res.status(201).json({
            data: student,
            message: "Data student Berhasil Ditambahkan",
        });
    } catch (error) {
        if (error.message.includes("Unique constraint failed on the fields: (`name`)")) {
            return res.status(400).json({
                message: "Nama Ini Sudah Ada!"
            });
        }

        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
});

router.delete("/student/:id", authenticateJWT, async (req, res) => {
    try {
        const student_package_id = parseInt(req.params.id);

        await deleteStudent(student_package_id);

        res.status(200).send("Data student Berhasil Dihapus");
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.patch("/student/:id", authenticateJWT,  async (req, res) => {
    try {
        const student_package_id = parseInt(req.params.id);
        const dataStudent = req.body;

        const student = await updateStudentById(student_package_id, dataStudent);

        res.status(200).json({
            data: student,
            message: "Data student Berhasil Diupdate",
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.get("/recommendations", authenticateJWT, async (req, res) => {
    try {
        const students = await calculateRecommendations();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
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

router.post('/packages/upload', upload.single('file'), async (req, res) => {
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
        await prisma.student_Package.create({
          data: {
            name: row.name,
            nis: row.nis,
            fisika: row['fisika'] || '', // Normalize column names if necessary
            ekonomi: row['ekonomi'] || 0,
            geografi: row['geografi'] || 0,
            sosiologi: row['sosiologi'] || 0,
            matematika: row['matematika'] || 0,
            informatika: row['informatika'] || 0,
            biologi: row['biologi'] || 0,
            kimia: row['kimia'] || 0,
          }
        });
      }
  
      res.status(200).json({ message: 'File processed successfully' });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ error: 'Error processing file' });
    }
  });

  router.delete('/students', async (req, res) => {
    try {
      await prisma.student_Package.deleteMany(); // Menghapus semua siswa
      res.status(200).json({ message: 'All students deleted successfully' });
    } catch (error) {
      console.error("Error deleting all students:", error);
      res.status(500).json({ error: 'An error occurred while deleting students' });
    }
  });

module.exports = router;
