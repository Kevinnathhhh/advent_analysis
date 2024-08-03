import Head from "next/head";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Center,
  Alert,
  AlertIcon,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/router";
import { FaUsers, FaGraduationCap } from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();

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

  const {
    data: eligibleData,
    isLoading: isLoadingEligible,
    error: errorEligible,
  } = useQuery({
    queryKey: ["eligibles"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/eligibles/results");
        return response.data;
      } catch (fetchError) {
        console.error("Error fetching eligible students:", fetchError);
        throw fetchError;
      }
    },
  });

  const {
    data: packageData,
    isLoading: isLoadingPackage,
    error: errorPackage,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/packages/recommendations");
        return response.data;
      } catch (fetchError) {
        console.error("Error fetching package students:", fetchError);
        throw fetchError;
      }
    },
  });

  const totalEligibleStudents = eligibleData?.length || 0;
  const totalPackageStudents = packageData?.length || 0;

  if (isLoadingEligible || isLoadingPackage) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (errorEligible || errorPackage) {
    return (
      <Alert status="error">
        <AlertIcon />
        Terjadi kesalahan saat mengambil data.
      </Alert>
    );
  }

  // Define colors for dark and light mode
  const cardBgColor = useColorModeValue("teal.100", "teal.700");
  const cardBgColorPackage = useColorModeValue("orange.100", "orange.700");
  const textColor = useColorModeValue("black", "white");

  return (
    <>
      <Head>
        <title>Headmaster Dashboard</title>
        <meta name="description" content="Dashboard page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container maxW="4xl" py={10}>
          <VStack spacing={6} align="stretch">
            <Heading mb={6}>Headmaster Dashboard</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Stat
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                bg={cardBgColor}
              >
                <Link href="/headmaster/eligible" passHref>
                  <Box display="flex" alignItems="center" as="a">
                    <Icon
                      as={FaGraduationCap}
                      w={10}
                      h={10}
                      mr={4}
                      color={textColor}
                    />
                    <Box>
                      <StatLabel color={textColor}>
                        Total Siswa Eligible
                      </StatLabel>
                      <StatNumber color={textColor}>
                        {totalEligibleStudents}
                      </StatNumber>
                    </Box>
                  </Box>
                </Link>
              </Stat>

              <Stat
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                bg={cardBgColorPackage}
              >
                <Link href="/headmaster/package" passHref>
                  <Box display="flex" alignItems="center" as="a">
                    <Icon as={FaUsers} w={10} h={10} mr={4} color={textColor} />
                    <Box>
                      <StatLabel color={textColor}>
                        Total Siswa dalam Paket
                      </StatLabel>
                      <StatNumber color={textColor}>
                        {totalPackageStudents}
                      </StatNumber>
                    </Box>
                  </Box>
                </Link>
              </Stat>
            </SimpleGrid>
          </VStack>
        </Container>
      </main>
    </>
  );
}
