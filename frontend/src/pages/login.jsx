// components/Login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Flex,
  Box,
  useToast,
} from "@chakra-ui/react";
import { axiosInstance } from "@/lib/axios";

const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    console.log(response);
    const token = response.data.token;
    localStorage.setItem("token", token); // Simpan token di localStorage
    return token;
  } catch (error) {
    console.log("Error", error);
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

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data); // Simpan token di localStorage
      router.push(`/dashboard`); // Redirect setelah login
    },
    onError: (error) => {
      console.error("Login failed:", error);
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
    mutation.mutate({ username, password });
  };

  return (
    <Flex minHeight="100vh" alignItems="center" justifyContent="center">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
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