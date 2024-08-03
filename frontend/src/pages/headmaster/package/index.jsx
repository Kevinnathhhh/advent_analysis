import Head from "next/head";
import {
  HStack,
  Box,
  TableContainer,
  Container,
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
  Select,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaTrash,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaUpload,
  FaUserPlus,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import AddStudentModal from "@/features/components/AddStudentModal";
import logoBase64 from "@/features/components/logo";

export default function Package() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState(null);
  const [file, setFile] = useState(null);

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
        const response = await axiosInstance.get("/packages/recommendations");
        console.log("Fetched data:", response.data);
        return response.data;
      } catch (fetchError) {
        console.error("Error fetching students:", fetchError);
        throw fetchError;
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }) => {
      try {
        const response = await axiosInstance.patch(`/packages/student/${id}`, {
          [field]: value,
        });
        console.log(`Successfully updated student ID: ${id}`, response.data);
      } catch (error) {
        console.error(
          `Error updating student ID: ${id}`,
          error.response?.data || error
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      // toast({
      //   title: "Student updated.",
      //   description: "The student information has been updated successfully.",
      //   status: "success",
      //   duration: 1000,
      //   isClosable: true,
      // });
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
      head: [["ID", "Name", "NIS", "P1", "P2", "P3", "Rec", "Approvals"]],
      body: data.map((student) => [
        student.student_package_id,
        student.name,
        student.nis,
        student.paket1,
        student.paket2,
        student.paket3,
        student.recommendation_teacher,
        student.principal_approval,
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
  
    doc.save("Report Package Student.pdf");
  };

  const handleApprovalChange = (student, isChecked) => {
    const newApprovalStatus = isChecked ? "done" : "not yet";
    updateMutation.mutate({
      id: student.student_package_id,
      field: "principal_approval",
      value: newApprovalStatus,
    });
  };

  const handleSortBy = (field) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  

  const toggleAllCheckboxes = async (value) => {
    if (data) {
      const promises = data.map((student) =>
        updateMutation.mutateAsync({
          id: student.student_package_id,
          field: "principal_approval",
          value: value,
        })
      );

      try {
        await Promise.all(promises);
        toast({
          title: "All students updated.",
          description: `All students have been ${value === "done" ? "checked" : "unchecked"} successfully.`,
          status: "success",
          duration: 1000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error updating students:", error);
        toast({
          title: "Error updating students.",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  

  const renderStudents = () => {
    const sortedData = [...(data || [])].sort((a, b) => {
      let comparison = 0;

      if (sortField === "approval") {
        comparison = a.principal_approval < b.principal_approval ? -1 : 1;
      } else if (sortField === "recommendation") {
        comparison =
          a.recommendation_teacher < b.recommendation_teacher ? -1 : 1;
      } else {
        comparison = a.name.localeCompare(b.name);
      }

      if (sortOrder === "desc") {
        comparison *= -1;
      }

      return comparison;
    });

    return sortedData.map((student) => {
      if (!student || !student.student_package_id) {
        console.warn("Invalid student data:", student);
        return null;
      }

      const isChecked = student.principal_approval === "done";

      return (
        <Tr key={student.student_package_id.toString()}>
          <Td>{student.student_package_id}</Td>
          <Td>{student.name}</Td>
          <Td>{student.nis}</Td>
          <Td>{student.paket1}</Td>
          <Td>{student.paket2}</Td>
          <Td>{student.paket3}</Td>
          <Td>{student.recommendation_teacher}</Td>
          <Td>
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleApprovalChange(student, e.target.checked)}
            >
              {student.principal_approval}
            </Checkbox>
          </Td>
        </Tr>
      );
    });
  };

  const handleClick = () => {
    router.push("/teacher/result");
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(["students"]);
  };

  return (
    <>
      <Head>
        <title>Student Package Management</title>
      </Head>
      <Container maxW="container.xl" p={4}>
        <VStack spacing={4} mb={4} align="start">
          <Heading>Approval Students</Heading>
          <HStack spacing={4}>
            <Button mb={4} colorScheme="teal" onClick={exportToPDF}>
              Export to PDF
            </Button>
            <Button
              mb={4}
              colorScheme="green"
              onClick={() => toggleAllCheckboxes("done")}
            >
              Check All
            </Button>
            <Button
              mb={4}
              colorScheme="red"
              onClick={() => toggleAllCheckboxes("not yet")}
            >
              Uncheck All
            </Button>
          </HStack>
        </VStack>
        {isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            Error: {error.message}
          </Alert>
        ) : (
          <TableContainer maxHeight="60vh" overflowY="auto">
            <Table variant="simple" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Student ID
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Name
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    NIS
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Package 1
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Package 2
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Package 3
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Recommendation
                    <IconButton
                      aria-label="Sort"
                      icon={
                        sortOrder === "asc" ? (
                          <FaSortAlphaDown color="black" />
                        ) : (
                          <FaSortAlphaUp color="black" />
                        )
                      }
                      onClick={() => handleSortBy("recommendation")}
                      ml={2}
                    />
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>
                    Approval
                    <IconButton
                      aria-label="Sort"
                      icon={
                        sortOrder === "asc" ? (
                          <FaSortAlphaDown color="black" />
                        ) : (
                          <FaSortAlphaUp color="black" />
                        )
                      }
                      onClick={() => handleSortBy("approval")}
                      ml={2}
                    />
                  </Th>
                </Tr>
              </Thead>
              <Tbody>{renderStudents()}</Tbody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
}
