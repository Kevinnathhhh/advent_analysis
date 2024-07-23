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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Center,
  ModalBody,
  ModalCloseButton,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash, FaEdit } from "react-icons/fa";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import AddEligibleModal from "@/features/components/AddEligibleModal";

export default function Eligible() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showActionColumn, setShowActionColumn] = useState(false);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
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
      onDeleteClose();
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
  };

  const handleEditClick = (student) => {
    console.log("Edit clicked for student:", student);
    setSelectedStudent(student);
    onEditOpen();
  };

  const toggleActionColumn = () => {
    setShowActionColumn((prev) => !prev);
  };

  const renderStudents = () => {
    return data?.map((student) => {
      if (!student || !student.student_eligible_id) {
        console.warn("Invalid student data:", student);
        return null;
      }

      return (
        <Tr key={student.student_eligible_id.toString()}>
          <Td>{student.student_eligible_id}</Td>
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
          <Td>{student.approval}</Td>
          {showActionColumn && (
            <Td>
              <IconButton
                icon={<FaEdit />}
                colorScheme="blue"
                onClick={() => handleEditClick(student)}
              />
              <IconButton
                icon={<FaTrash />}
                colorScheme="red"
                onClick={() => handleDeleteClick(student)}
                ml={3}
              />
            </Td>
          )}
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

  const handleSuccess = () => {
    queryClient.invalidateQueries(["students"]);
  };

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
              gap={4} // Add some space between the items
            >
              <AddEligibleModal onSuccess={handleSuccess} />
              <Button mb={4} colorScheme="blue" onClick={toggleActionColumn}>
                {showActionColumn ? "Sembunyikan Aksi" : "Tampilkan Aksi"}
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
                        ID
                      </Th>
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
                      {showActionColumn && (
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Aksi
                        </Th>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>{renderStudents()}</Tbody>
                </Table>
              </TableContainer>
            </Box>
          </VStack>
        </Container>

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

        {/* <EditStudentModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          student={selectedStudent}
          onSuccess={handleSuccess}
        /> */}
      </main>
    </>
  );
}
