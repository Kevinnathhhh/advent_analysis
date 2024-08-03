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
        console.log(`Updating student with ID: ${id} to ${recommendation_teacher}`);
        const response = await axiosInstance.patch(`/eligibles/student/${id}`, {
          recommendation_teacher,
        });
        console.log(`Response from server:`, response.data);
        return response.data; // Mengembalikan data untuk diperbarui di cache
      } catch (error) {
        console.error(`Error updating student with ID: ${id}`, error.response?.data || error);
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

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    autoTable(doc, {
      head: [
        [
          "No",
          "Name",
          "NIS",
          "Jurusan",
          "Semester 1",
          "Semester 2",
          "Semester 3",
          "Semester 4",
          "Semester 5",
          "Average",
          "Result",
        ],
      ],
      body: data.map((student) => [
        student.student_eligible_id,
        student.name,
        student.nis,
        student.jurusan,
        student.nilaisemester1,
        student.nilaisemester2,
        student.nilaisemester3,
        student.nilaisemester4,
        student.nilaisemester5,
        student.averageScore,
        student.eligible,
      ]),
    });

    doc.save("Eligible Results.pdf");
  };

  const handleDeleteClick = (student) => {
    console.log("Delete clicked for student:", student);
    setSelectedStudent(student);
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (selectedStudent) {
      console.log(
        `Confirming delete for student: ${selectedStudent.student_eligible_id}`
      );
      deleteMutation.mutate(selectedStudent.student_eligible_id);
    } else {
      console.warn("No student selected for deletion");
    }
    onDeleteClose();
  };

  const handleDeleteAllClick = () => {
    onDeleteAllOpen();
  };

  const handleDeleteAllConfirm = () => {
    deleteAllMutation.mutate();
    onDeleteAllClose();
  };

  const handleApprovalChange = (student, isChecked) => {
    const newApprovalStatus = isChecked ? "done" : "not yet";

    updateMutation.mutate({
      id: student.student_eligible_id,
      approval: newApprovalStatus,
    });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      uploadMutation.mutate(formData);
    } else {
      toast({
        title: "No file selected.",
        description: "Please select a file to upload.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
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
          <Td>{student.nilaisemester1}</Td>
          <Td>{student.nilaisemester2}</Td>
          <Td>{student.nilaisemester3}</Td>
          <Td>{student.nilaisemester4}</Td>
          <Td>{student.nilaisemester5}</Td>
          <Td>
            <IconButton
              icon={<FaTrash />}
              colorScheme="red"
              onClick={() => handleDeleteClick(student)}
            />
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

  const handleClick = () => {
    router.push("/teacher/eligible/result-eligible");
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(["students"]);
  };

  return (
    <>
      <Head>
        <title>Eligible Students</title>
      </Head>
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          <VStack align={"start"} spacing={4}>
            <Heading as="h1" size="xl">
              Eligible Students
            </Heading>
            <HStack spacing={4}>
              <AddEligibleModal
                queryClient={queryClient}
                isOpen={isAddStudentOpen}
                onClose={onAddStudentClose}
                onSuccess={handleSuccess}
              />
              <Button mb={4} colorScheme="blue" onClick={onUploadOpen}>
                Upload File
              </Button>
              <Button mb={4} colorScheme="red" onClick={handleDeleteAllClick}>
                Delete All
              </Button>
              <Button mb={4} colorScheme="purple" onClick={handleClick}>
              Result
            </Button>
            </HStack>
          </VStack>
          <TableContainer maxHeight="60vh" overflowY="auto">
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th  position="sticky" top={0} bg="white" zIndex={1}>No</Th>
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
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Nilai Semester 1</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Nilai Semester 2</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Nilai Semester 3</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Nilai Semester 4</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Nilai Semester 5</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>{renderStudents()}</Tbody>
            </Table>
          </TableContainer>
        </VStack>
      </Container>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete {selectedStudent?.name}?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteConfirm}>
              Delete
            </Button>
            <Button variant="ghost" onClick={onDeleteClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Students</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="file" onChange={handleFileChange} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpload}>
              Upload
            </Button>
            <Button variant="ghost" onClick={onUploadClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteAllOpen} onClose={onDeleteAllClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete All Students</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete all students?</ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteAllConfirm}>
              Delete All
            </Button>
            <Button variant="ghost" onClick={onDeleteAllClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
