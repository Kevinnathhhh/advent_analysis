import { Box, Flex, Button, Text, useColorMode, useColorModeValue, Stack, Image } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logoBase64 from './logo';

function HeadmasterNavbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Menghapus token di localStorage
    router.push('/login'); // Redirect ke halaman login
  };

  return (
    <Box bg={bgColor} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Box display="flex" alignItems="center">
          <Image
            src={logoBase64} // Using the base64 string for the logo
            alt="Salemba Advent School Logo"
            boxSize="40px"
            mr={2} // Margin to the right of the logo
            borderRadius="100%"
          />
          <Link href="/headmaster/dashboard">
            <Text fontWeight="bold">Salemba Advent School</Text>
          </Link>
        </Box>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={7}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
            <Link href="/headmaster/dashboard">
              <Button>Dashboard</Button>
            </Link>
            <Link href="/headmaster/eligible">
              <Button>Eligible</Button>
            </Link>
            <Link href="/headmaster/package">
              <Button>Study Package</Button>
            </Link>
            <Button onClick={handleLogout}>Logout</Button>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}

export default HeadmasterNavbar;
