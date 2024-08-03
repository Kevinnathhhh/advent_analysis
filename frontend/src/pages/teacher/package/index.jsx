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

export default function Package() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState(null);
  const [file, setFile] = useState(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
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
        const response = await axiosInstance.get("/packages/recommendations");
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
        const response = await axiosInstance.delete(`/packages/student/${id}`);
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
        duration: 2000,
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
        console.log(`Attempting to delete all students`);
        const response = await axiosInstance.delete(`/packages/students`);
        console.log(`Successfully deleted all students`, response.data);
      } catch (error) {
        console.error(
          `Error deleting all students`,
          error.response?.data || error
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toast({
        title: "All students deleted.",
        description: "All students have been deleted successfully.",
        status: "success",
        duration: 4000,
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

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await axiosInstance.post(
          "/packages/upload",
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
      onUploadClose(); // Close the upload modal
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


  const handleDeleteClick = (student) => {
    console.log("Delete clicked for student:", student);
    setSelectedStudent(student);
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (selectedStudent) {
      console.log(
        `Confirming delete for student: ${selectedStudent.student_package_id}`
      );
      deleteMutation.mutate(selectedStudent.student_package_id);
    } else {
      console.warn("No student selected for deletion");
    }
    onDeleteClose();
  };

  const handleDeleteAllConfirm = () => {
    console.log(`Confirming delete all`);
    deleteAllMutation.mutate();
    onDeleteAllClose();
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
          <Td>{student.fisika}</Td>
          <Td>{student.ekonomi}</Td>
          <Td>{student.geografi}</Td>
          <Td>{student.sosiologi}</Td>
          <Td>{student.matematika}</Td>
          <Td>{student.informatika}</Td>
          <Td>{student.biologi}</Td>
          <Td>{student.kimia}</Td>
          <Td>
            <IconButton
              aria-label="Delete student"
              icon={<FaTrash />}
              onClick={() => handleDeleteClick(student)}
            />
          </Td>
        </Tr>
      );
    });
  };

  const handleClick = () => {
    router.push("/teacher/package/result");
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
          <Heading>Student Package List</Heading>
          <HStack spacing={4}>
            <AddStudentModal
              queryClient={queryClient}
              isOpen={isAddStudentOpen}
              onClose={onAddStudentClose}
              onSuccess={handleSuccess}
            />
            <Button
              mb={4}
              colorScheme="blue"
              onClick={onUploadOpen}
              leftIcon={<FaUpload />}
            >
              Upload File
            </Button>
            <Button mb={4} colorScheme="red" onClick={onDeleteAllOpen}>
              Delete All
            </Button>
            <Button mb={4} colorScheme="purple" onClick={handleClick}>
              Result
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
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Student ID</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Name</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>NIS</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Fisika</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Ekonomi</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Geografi</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Sosiologi</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Matematika</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Informatika</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Biologi</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Kimia</Th>
                  <Th position="sticky" top={0} bg="white" zIndex={1}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>{renderStudents()}</Tbody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={uploadMutation.isLoading}
            >
              Upload
            </Button>
            <Button colorScheme="gray" onClick={onUploadClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this student?</ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isLoading}
            >
              Delete
            </Button>
            <Button colorScheme="gray" onClick={onDeleteClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete All Confirmation Modal */}
      <Modal isOpen={isDeleteAllOpen} onClose={onDeleteAllClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion of All Students</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete all students?</ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={handleDeleteAllConfirm}
              isLoading={deleteAllMutation.isLoading}
            >
              Delete All
            </Button>
            <Button colorScheme="gray" onClick={onDeleteAllClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}