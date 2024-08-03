import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Flex,
  Box,
  useToast,
  Image, // Import komponen Image dari Chakra UI
} from "@chakra-ui/react";
import { axiosInstance } from "@/lib/axios";
import logoBase64 from "@/features/components/logo";

const logo = logoBase64;

const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    const token = response.data.token;
    const role = credentials.role; // Ambil role dari credentials
    localStorage.setItem("token", token); // Simpan token di localStorage
    localStorage.setItem("role", role); // Simpan role di localStorage
    return { token, role }; // Kembalikan token dan role
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Login failed");
    } else {
      throw new Error("Login failed"); // Jika tidak ada respons atau data respons
    }
  }
};

const Login = () => {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // State untuk role

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ role }) => {
      // Redirect berdasarkan role
      if (role === "Admin") {
        router.push(`/teacher/dashboard`);
      } else if (role === "Headmaster") {
        router.push(`/headmaster/dashboard`);
      }
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Login failed",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ username, password, role });
  };

  return (
    <Flex minHeight="100vh" alignItems="center" justifyContent="center">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        textAlign="center" // Agar logo dan form berada di tengah
      >
        {/* Menambahkan logo di atas form */}
        <Image
          src={logo}
          alt="Logo"
          boxSize="100px" // Ukuran logo, sesuaikan dengan kebutuhan
          mb={4} // Jarak antara logo dan form
          mx="auto" // Menyusun logo di tengah
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" // Menambahkan shadow
          borderRadius="100%"
        />
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Role</FormLabel>
            <Select
              placeholder="Select role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Headmaster">Headmaster</option>
            </Select>
          </FormControl>
          <Button
            mt={4}
            colorScheme="teal"
            type="submit"
            isLoading={mutation.isLoading}
          >
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
