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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import AddStudentModal from "@/features/components/AddStudentModal";

export default function Package() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

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

  const updateMutation = useMutation({
    mutationFn: async ({ id, approval }) => {
      try {
        const response = await axiosInstance.patch(`/packages/student/${id}`, { approval });
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

  const handleApprovalChange = (student, isChecked) => {
    const newApprovalStatus = isChecked ? 'done' : 'not yet';
    
    updateMutation.mutate({
      id: student.student_package_id,
      approval: newApprovalStatus,
    });
  };

  const renderStudents = () => {
    return data?.map((student) => {
      if (!student || !student.student_package_id) {
        console.warn("Invalid student data:", student);
        return null;
      }

      const isChecked = student.approval === 'done';

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
            <Td>{student.paket1}</Td>
            <Td>{student.paket2}</Td>
            <Td>{student.paket3}</Td>
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
              <AddStudentModal onSuccess={() => queryClient.invalidateQueries(["students"])} />
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
                          Fisika
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Ekonomi
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Geografi
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Sosiologi
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Matematika
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Informatika
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Biologi
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Kimia
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Paket 1
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Paket 2
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Paket 3
                        </Th>
                        <Th
                          position="sticky"
                          top={0}
                          bg="white"
                          zIndex={1}
                          boxShadow="sm"
                        >
                          Recommendation
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
      </main>
    </>
  );
}
