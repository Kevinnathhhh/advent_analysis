import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    useToast,
  } from "@chakra-ui/react";
  import { axiosInstance } from "@/lib/axios";
  import { useFormik } from "formik";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  
  const AddEligibleModal = ({ onSuccess }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
  
    const formik = useFormik({
      initialValues: {
        name: "",
        nis: "",
        jurusan: "",
        nilaisemester1: "",
        nilaisemester2: "",
        nilaisemester3: "",
        nilaisemester4: "",
        nilaisemester5: "",
      },
      onSubmit: async (values) => {
        const {
          name,
          nis,
          jurusan,
          nilaisemester1,
          nilaisemester2,
          nilaisemester3,
          nilaisemester4,
          nilaisemester5,
        } = values;
        // Pastikan semua nilai mata pelajaran dikonversi menjadi integer
        mutate({
          name,
          nis: parseInt(nis),
          jurusan: jurusan,
          nilaisemester1: parseFloat(nilaisemester1),
          nilaisemester2: parseFloat(nilaisemester2),
          nilaisemester3: parseFloat(nilaisemester3),
          nilaisemester4: parseFloat(nilaisemester4),
          nilaisemester5: parseFloat(nilaisemester5),
        });
      },
    });
  
    const { mutate } = useMutation({
      mutationFn: async (body) => {
        console.log("Sending request with body:", body);
        const response = await axiosInstance.post("/eligibles/students", body);
        return response;
      },
      onSuccess: () => {
        formik.resetForm();
        onClose();
        toast({
          title: "Data Siswa Berhasil Ditambah",
          status: "success",
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error) => {
        console.error("Error response:", error.response);
        console.error("Error:", error);
        toast({
            description: error.response?.data?.message || error.message || "An error occurred",
            status: "error",
        });
    },
    
    });
  
    const handleFormInput = (event) => {
      formik.setFieldValue(event.target.name, event.target.value);
    };
  
    return (
      <>
        <Button onClick={onOpen} colorScheme="teal" mb={4}>
          Add Student
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Student</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={formik.handleSubmit}>
              <ModalBody>
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    onChange={handleFormInput}
                    value={formik.values.name}
                  />
                </FormControl>
                <FormControl id="nis" isRequired>
                  <FormLabel>NIS</FormLabel>
                  <Input
                    name="nis"
                    type="number"
                    onChange={handleFormInput}
                    value={formik.values.nis}
                  />
                </FormControl>
                <FormControl id="jurusan" isRequired>
                  <FormLabel>Jurusan</FormLabel>
                  <Input
                    name="jurusan"
                    onChange={handleFormInput}
                    value={formik.values.jurusan}
                  />
                </FormControl>
                <FormControl id="nilaisemester1" isRequired>
                  <FormLabel>Semester 1</FormLabel>
                  <Input
                    name="nilaisemester1"
                    type="number"
                    onChange={handleFormInput}
                    value={formik.values.nilaisemester1}
                  />
                </FormControl>
                <FormControl id="nilaisemester2" isRequired>
                  <FormLabel>Semester 2</FormLabel>
                  <Input
                    name="nilaisemester2"
                    type="number"
                    onChange={handleFormInput}
                    value={formik.values.nilaisemester2}
                  />
                </FormControl>
                <FormControl id="nilaisemester3" isRequired>
                  <FormLabel>Semester 3</FormLabel>
                  <Input
                    name="nilaisemester3"
                    type="number"
                    onChange={handleFormInput}
                    value={formik.values.nilaisemester3}
                  />
                </FormControl>
                <FormControl id="nilaisemester4" isRequired>
                  <FormLabel>Semester 4</FormLabel>
                  <Input
                    name="nilaisemester4"
                    type="number"
                    onChange={handleFormInput}
                    value={formik.values.nilaisemester4}
                  />
                </FormControl>
                <FormControl id="nilaisemester5" isRequired>
                  <FormLabel>Semester 5</FormLabel>
                  <Input
                    name="nilaisemester5"
                    type="number"
                    onChange={handleFormInput}
                    value={formik.values.nilaisemester5}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" type="submit" mr={3}>
                  Add
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default AddEligibleModal;
  