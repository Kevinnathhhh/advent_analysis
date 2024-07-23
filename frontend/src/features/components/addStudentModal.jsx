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

const AddStudentModal = ({ onSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      name: "",
      nis: "",
      fisika: "",
      ekonomi: "",
      geografi: "",
      sosiologi: "",
      matematika: "",
      informatika: "",
      biologi: "",
      kimia: "",
    },
    onSubmit: async (values) => {
      const {
        name,
        nis,
        fisika,
        ekonomi,
        geografi,
        sosiologi,
        matematika,
        informatika,
        biologi,
        kimia,
      } = values;
      // Pastikan semua nilai mata pelajaran dikonversi menjadi integer
      mutate({
        name,
        nis: parseInt(nis),
        fisika: parseInt(fisika),
        ekonomi: parseInt(ekonomi),
        geografi: parseInt(geografi),
        sosiologi: parseInt(sosiologi),
        matematika: parseInt(matematika),
        informatika: parseInt(informatika),
        biologi: parseInt(biologi),
        kimia: parseInt(kimia),
      });
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (body) => {
      console.log("Sending request with body:", body);
      const response = await axiosInstance.post("/packages/students", body);
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
              <FormControl id="fisika" isRequired>
                <FormLabel>Fisika</FormLabel>
                <Input
                  name="fisika"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.fisika}
                />
              </FormControl>
              <FormControl id="ekonomi" isRequired>
                <FormLabel>Ekonomi</FormLabel>
                <Input
                  name="ekonomi"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.ekonomi}
                />
              </FormControl>
              <FormControl id="geografi" isRequired>
                <FormLabel>Geografi</FormLabel>
                <Input
                  name="geografi"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.geografi}
                />
              </FormControl>
              <FormControl id="sosiologi" isRequired>
                <FormLabel>Sosiologi</FormLabel>
                <Input
                  name="sosiologi"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.sosiologi}
                />
              </FormControl>
              <FormControl id="matematika" isRequired>
                <FormLabel>Matematika</FormLabel>
                <Input
                  name="matematika"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.matematika}
                />
              </FormControl>
              <FormControl id="informatika" isRequired>
                <FormLabel>Informatika</FormLabel>
                <Input
                  name="informatika"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.informatika}
                />
              </FormControl>
              <FormControl id="biologi" isRequired>
                <FormLabel>Biologi</FormLabel>
                <Input
                  name="biologi"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.biologi}
                />
              </FormControl>
              <FormControl id="kimia" isRequired>
                <FormLabel>Kimia</FormLabel>
                <Input
                  name="kimia"
                  type="number"
                  onChange={handleFormInput}
                  value={formik.values.kimia}
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

export default AddStudentModal;
