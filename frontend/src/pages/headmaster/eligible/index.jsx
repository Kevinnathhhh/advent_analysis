import Head from "next/head";
import {
  TableContainer,
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
  Center,
  useToast,
  VStack,
  Checkbox,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import logoBase64 from "@/features/components/logo";

export default function Eligible() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("name");

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
        duration: 1000,
        isClosable: true,
      });
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast({
        title: "Error updating student.",
        description: error.message,
        status: "error",
        duration: 3000,
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
  
    // Mengurutkan data berdasarkan nama
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
  
    // Tambahkan halaman baru untuk tabel
    doc.addPage();
  
    autoTable(doc, {
      head: [
        [
          "No",
          "Name",
          "NIS",
          "Jurusan",
          "Average",
          "Result",
        ],
      ],
      body: sortedData.map((student, index) => [
        index + 1, // Nomor urut dari 1
        student.name,
        student.nis,
        student.jurusan,
        student.averageScore,
        student.eligible,
      ]),
      margin: { bottom: 50 }, // Menyediakan ruang untuk tanda tangan
    });
  
    doc.save("Report Eligible Student.pdf");
  };
  

  const handleApprovalChange = (student, isEligibleChecked) => {
    const newApprovalStatus = isEligibleChecked ? "Eligible" : "Tidak Eligible";
  
    updateMutation.mutate({
      id: student.student_eligible_id,
      approval: newApprovalStatus,
    });
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
            ? a[sortBy] === "Eligible"
              ? -1
              : 1
            : a[sortBy] === "Eligible"
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
      
          const isEligibleChecked = student.approval === "Eligible";
          const isNotEligibleChecked = student.approval === "Tidak Eligible";
      
          return (
            <Tr key={student.student_eligible_id.toString()}>
              <Td>{index + 1}</Td>
              <Td>{student.name}</Td>
              <Td>{student.nis}</Td>
              <Td>{student.jurusan}</Td>
              <Td>{student.averageScore}</Td>
              <Td>{student.eligible}</Td>
              <Td>{student.recommendation_teacher}</Td>
              <Td>
                <HStack spacing={2}>
                  <Checkbox
                    isChecked={isEligibleChecked}
                    onChange={(e) => handleApprovalChange(student, e.target.checked)}
                  >
                    Eligible
                  </Checkbox>
                  <Checkbox
                    isChecked={isNotEligibleChecked}
                    onChange={(e) => handleApprovalChange(student, !e.target.checked)}
                  >
                    Tidak Eligible
                  </Checkbox>
                </HStack>
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
        <title>Approval Eligible</title>
      </Head>
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          <VStack align={"start"} spacing={4}>
            <Heading as="h1" size="xl">
              Approval Eligible
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
                  <Th position="sticky" top={0} bg="white" zIndex={1}>No</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1} onClick={handleSortByName} style={{ cursor: "pointer" }}>
                    Name{" "}
                    {sortBy === "name"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>NIS</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Jurusan</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}
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
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Eligible</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Recommendation</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}
                    onClick={handleSortByApproval}
                    style={{ cursor: "pointer" }}
                  >
                    Approval{" "}
                    {sortBy === "approval"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
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
