import Head from "next/head";
import {
  Box,
  TableContainer,
  Select,
  Container,
  HStack,
  Heading,
  Table,
  Tbody,
  Thead,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  IconButton,
  Center,
  useToast,
  VStack,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "@/features/components/logo";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import AddEligibleModal from "@/features/components/AddEligibleModal";

export default function Eligible() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("name");

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const {
    isOpen: isAddStudentOpen,
    onOpen: onAddStudentOpen,
    onClose: onAddStudentClose,
  } = useDisclosure();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/eligibles/results");
        console.log("Fetched data:", response.data);
        return response.data;
      } catch (fetchError) {
        console.error("Error fetching students:", fetchError);
        throw fetchError;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        console.log(`Attempting to delete student with ID: ${id}`);
        const response = await axiosInstance.delete(`/eligibles/student/${id}`);
        console.log(
          `Successfully deleted student with ID: ${id}`,
          response.data
        );
      } catch (error) {
        console.error(
          `Error deleting student with ID: ${id}`,
          error.response?.data || error
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toast({
        title: "Student deleted.",
        description: "The student has been deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast({
        title: "Error deleting student.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting to delete all students");
        const response = await axiosInstance.delete(`/eligibles/students`);
        console.log("Successfully deleted all students", response.data);
      } catch (error) {
        console.error(
          "Error deleting all students:",
          error.response?.data || error
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toast({
        title: "All students deleted.",
        description: "All student records have been deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      console.error("Delete all mutation error:", error);
      toast({
        title: "Error deleting all students.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, approval }) => {
      try {
        const response = await axiosInstance.patch(`/eligibles/student/${id}`, {
          approval,
        });
        console.log(
          `Successfully updated student with ID: ${id}`,
          response.data
        );
      } catch (error) {
        console.error(
          `Error updating student with ID: ${id}`,
          error.response?.data || error
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toast({
        title: "Student updated.",
        description: "The student's approval status has been updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast({
        title: "Error updating student.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleRecommendation = useMutation({
    mutationFn: async ({ id, recommendation_teacher }) => {
      try {
        console.log(
          `Updating student with ID: ${id} to ${recommendation_teacher}`
        );
        const response = await axiosInstance.patch(`/eligibles/student/${id}`, {
          recommendation_teacher,
        });
        console.log(`Response from server:`, response.data);
        return response.data; // Mengembalikan data untuk diperbarui di cache
      } catch (error) {
        console.error(
          `Error updating student with ID: ${id}`,
          error.response?.data || error
        );
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Mutation successful");
      queryClient.invalidateQueries(["students"]);
      toast({
        title: "Student updated.",
        description: "The student's recommendation has been updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast({
        title: "Error updating student.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await axiosInstance.post(
          "/eligibles/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("File uploaded successfully:", response.data);
      } catch (error) {
        console.error("Error uploading file:", error.response?.data || error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toast({
        title: "File uploaded.",
        description: "The file has been uploaded and processed successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onUploadClose();
    },
    onError: (error) => {
      console.error("Upload mutation error:", error);
      toast({
        title: "Error uploading file.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const logo = logoBase64;
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // Menambahkan logo
    const logoWidth = 80;
    const logoHeight = 80;
    const logoX = pageWidth / 2 - logoWidth / 2;
    const logoY = 40;
  
    doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);
  
    // Menambahkan teks di bawah logo
    const textY = logoY + logoHeight + 20; // Menambahkan jarak 20 piksel di bawah logo
    doc.setFontSize(24);
    doc.text("Student Report", pageWidth / 2, textY, { align: "center" });
  
    // Menambahkan teks tanggal di bawah judul
    const dateY = textY + 30; // Menambahkan jarak 30 piksel di bawah judul
    doc.setFontSize(16);
    doc.text(
      "Generated on: " + new Date().toLocaleDateString(),
      pageWidth / 2,
      dateY,
      { align: "center" }
    );
  
    // Tambahkan halaman baru untuk tabel
    doc.addPage();
  
    autoTable(doc, {
      head: [["ID", "Name", "NIS", "Jurusan", "Avarage Score", "Eligible", "Rec"]],
      body: data.map((student) => [
        student.student_eligible_id,
        student.name,
        student.nis,
        student.jurusan,
        student.averageScore,
        student.eligible,
        student.recommendation_teacher,
      ]),
      margin: { bottom: 50 }, // Menyediakan ruang untuk tanda tangan
    });
  
    // Menambahkan area tanda tangan di bagian bawah kiri
    const signatureBoxWidth = 80;
    const signatureBoxHeight = 40;
    const leftSignatureX = 20; // Jarak dari tepi kiri
    const bottomSignatureY = pageHeight - 20 - signatureBoxHeight; // Jarak dari tepi bawah
  
    doc.setFontSize(12);
    doc.text("Headmaster:", leftSignatureX, bottomSignatureY - 10); // Label untuk area tanda tangan
    doc.rect(leftSignatureX, bottomSignatureY, signatureBoxWidth, signatureBoxHeight); // Kotak area tanda tangan
  
    // Menambahkan area tanda tangan di bagian bawah kanan
    const rightSignatureX = pageWidth - 20 - signatureBoxWidth; // Jarak dari tepi kanan
  
    doc.text("Teacher:", rightSignatureX, bottomSignatureY - 10); // Label untuk area tanda tangan
    doc.rect(rightSignatureX, bottomSignatureY, signatureBoxWidth, signatureBoxHeight); // Kotak area tanda tangan
  
    doc.save("Report Eligible Student.pdf");
  };

  const handleSortByName = () => {
    setSortBy("name");
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSortByAverageScore = () => {
    setSortBy("averageScore");
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSortByApproval = () => {
    setSortBy("approval");
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const sortedData = Array.isArray(data)
    ? [...data]?.sort((a, b) => {
        if (!a[sortBy] || !b[sortBy]) return 0;

        if (sortBy === "averageScore") {
          return sortDirection === "asc"
            ? a[sortBy] - b[sortBy]
            : b[sortBy] - a[sortBy];
        } else if (sortBy === "approval") {
          return sortDirection === "asc"
            ? a[sortBy] === "done"
              ? -1
              : 1
            : a[sortBy] === "done"
            ? 1
            : -1;
        } else {
          return sortDirection === "asc"
            ? a[sortBy].localeCompare(b[sortBy])
            : b[sortBy].localeCompare(a[sortBy]);
        }
      })
    : [];

  const renderStudents = () => {
    return sortedData?.map((student, index) => {
      if (!student || !student.student_eligible_id) {
        console.warn("Invalid student data:", student);
        return null;
      }

      const isChecked = student.approval === "done";

      return (
        <Tr key={student.student_eligible_id.toString()}>
          <Td>{index + 1}</Td>
          <Td>{student.name}</Td>
          <Td>{student.nis}</Td>
          <Td>{student.jurusan}</Td>
          <Td>{student.averageScore}</Td>
          <Td>{student.eligible}</Td>
          {/* <Td>{student.recommendation_teacher}</Td> */}
          <Td>
            <Select
              value={student.recommendation_teacher || ""}
              onChange={(e) =>
                handleRecommendation.mutate({
                  id: student.student_eligible_id,
                  recommendation_teacher: e.target.value,
                })
              }
            >
              <option value="">{student.recommendation_teacher}</option>
              <option value="Eligible">Eligible</option>
              <option value="Tidak Eligible">Tidak Eligible</option>
            </Select>
          </Td>
        </Tr>
      );
    });
  };

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    console.error("Error loading students:", error);
    return (
      <Alert status="error">
        <AlertIcon />
        Terjadi kesalahan saat mengambil data.
      </Alert>
    );
  }
  return (
    <>
      <Head>
        <title>Recommendation Eligible</title>
      </Head>
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          <VStack align={"start"} spacing={4}>
            <Heading as="h1" size="xl">
              Recommendation Eligible
            </Heading>
            <HStack spacing={4}>
              <Button mb={4} colorScheme="teal" onClick={exportToPDF}>
                Export to PDF
              </Button>
            </HStack>
          </VStack>
          <TableContainer maxHeight="60vh" overflowY="auto">
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    No
                  </Th>
                  <Th
                    position="sticky"
                    top={0}
                    bg="white"
                    zIndex={1}
                    onClick={handleSortByName}
                    style={{ cursor: "pointer" }}
                  >
                    Name{" "}
                    {sortBy === "name"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    NIS
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Jurusan
                  </Th>
                  <Th
                    position="sticky"
                    top={0}
                    bg="white"
                    zIndex={1}
                    onClick={handleSortByAverageScore}
                    style={{ cursor: "pointer" }}
                  >
                    Average Score{" "}
                    {sortBy === "averageScore"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Eligible
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Recommendation
                  </Th>
                </Tr>
              </Thead>
              <Tbody>{renderStudents()}</Tbody>
            </Table>
          </TableContainer>
        </VStack>
      </Container>
    </>
  );
}
