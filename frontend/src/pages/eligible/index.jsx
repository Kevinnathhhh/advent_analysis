import Head from "next/head";
import {
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
  Input
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import AddEligibleModal from "@/features/components/AddEligibleModal";

export default function Eligible() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // Tambahkan state untuk urutan sort
  const [sortBy, setSortBy] = useState('name'); // State untuk menentukan kriteria sort

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
        console.log(`Successfully deleted student with ID: ${id}`, response.data);
      } catch (error) {
        console.error(`Error deleting student with ID: ${id}`, error.response?.data || error);
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
        console.error("Error deleting all students:", error.response?.data || error);
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
        const response = await axiosInstance.patch(`/eligibles/student/${id}`, { approval });
        console.log(`Successfully updated student with ID: ${id}`, response.data);
      } catch (error) {
        console.error(`Error updating student with ID: ${id}`, error.response?.data || error);
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

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await axiosInstance.post('/eligibles/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
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
      console.log(`Confirming delete for student: ${selectedStudent.student_eligible_id}`);
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
    const newApprovalStatus = isChecked ? 'done' : 'not yet';
    
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
      formData.append('file', file);
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
    setSortBy('name');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortByAverageScore = () => {
    setSortBy('averageScore');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortByApproval = () => {
    setSortBy('approval');
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortedData = [...data]?.sort((a, b) => {
    if (!a[sortBy] || !b[sortBy]) return 0; // Handle cases where sorting key might be missing

    if (sortBy === 'averageScore') {
      return sortDirection === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    } else if (sortBy === 'approval') {
      return sortDirection === 'asc' ? (a[sortBy] === 'done' ? -1 : 1) : (a[sortBy] === 'done' ? 1 : -1);
    } else {
      return sortDirection === 'asc' ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy]);
    }
  });

  const renderStudents = () => {
    return sortedData?.map((student, index) => {
      if (!student || !student.student_eligible_id) {
        console.warn("Invalid student data:", student);
        return null;
      }

      const isChecked = student.approval === 'done';

      return (
        <Tr key={student.student_eligible_id.toString()}>
          <Td>{index + 1}</Td> {/* Nomor urut otomatis */}
          <Td>{student.name}</Td>
          <Td>{student.nis}</Td>
          <Td>{student.jurusan}</Td>
          <Td>{student.nilaisemester1}</Td>
          <Td>{student.nilaisemester2}</Td>
          <Td>{student.nilaisemester3}</Td>
          <Td>{student.nilaisemester4}</Td>
          <Td>{student.nilaisemester5}</Td>
          <Td>{student.averageScore}</Td>
          <Td>{student.eligible}</Td>
          <Td>
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleApprovalChange(student, e.target.checked)}
            >
            </Checkbox>
          </Td>
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

  return (
    <>
      <Head>
        <title>Rekomendasi Siswa</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container maxW="8xl" py={10}>
          <VStack spacing={6} align="stretch">
            <Heading mb={0}>Hasil Rekomendasi</Heading>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              mb={0}
              gap={4}
            >
              <AddEligibleModal onSuccess={() => queryClient.invalidateQueries(["students"])} />
              <Button mb={4} onClick={onUploadOpen}>Upload Excel</Button>
              <Button mb={4} colorScheme="red" onClick={handleDeleteAllClick}>Hapus Semua</Button>
              <Button mb={4} colorScheme="blue" onClick={handleSortByName}>
                Sort by Name ({sortDirection === 'asc' ? 'Ascending' : 'Descending'})
              </Button>
              <Button mb={4} colorScheme="blue" onClick={handleSortByAverageScore}>
                Sort by Average Score ({sortDirection === 'asc' ? 'Ascending' : 'Descending'})
              </Button>
              <Button mb={4} colorScheme="blue" onClick={handleSortByApproval}>
                Sort by Approval ({sortDirection === 'asc' ? 'Ascending' : 'Descending'})
              </Button>
            </Box>

            <Box flex="1" maxHeight="60vh" overflowY="auto">
              <TableContainer maxHeight="60vh" overflowY="auto">
                <Table variant="striped" colorScheme="teal">
                  <Thead>
                    <Tr>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        No
                      </Th> {/* Mengganti kolom ID dengan No */}
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Nama
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        NIS
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Jurusan
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Semester 1
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Semester 2
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Semester 3
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Semester 4
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Semester 5
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Rata-rata Semester
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Eligible
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Approval
                      </Th>
                      <Th
                        position="sticky"
                        top={0}
                        bg="white"
                        zIndex={1}
                        boxShadow="sm"
                      >
                        Aksi
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>{renderStudents()}</Tbody>
                </Table>
              </TableContainer>
            </Box>
          </VStack>
        </Container>

        <Head>
        <title>Student Package Management</title>
      </Head>
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Konfirmasi Penghapusan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Apakah Anda yakin ingin menghapus data siswa{" "}
              {selectedStudent?.name}?
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" onClick={handleDeleteConfirm}>
                Hapus
              </Button>
              <Button onClick={onDeleteClose} ml={3}>
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Upload Excel</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleUpload}>
                Upload
              </Button>
              <Button onClick={onUploadClose} ml={3}>
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isDeleteAllOpen} onClose={onDeleteAllClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Konfirmasi Penghapusan Semua</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Apakah Anda yakin ingin menghapus semua data siswa?
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" onClick={handleDeleteAllConfirm}>
                Hapus Semua
              </Button>
              <Button onClick={onDeleteAllClose} ml={3}>
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
