// components/Navbar.js
import { Box, Flex, Button, Text, useColorMode, useColorModeValue, Stack } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import Link from 'next/link';

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.100', 'gray.900');

  return (
    <Box bg={bgColor} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Box>
          <Link href="/">
            <Text fontWeight="bold">Advent School</Text>
          </Link>
        </Box>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={7}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
            <Link href="/eligible">
              <Button>Eligible</Button>
            </Link>
            <Link href="/package">
              <Button>Study Package</Button>
            </Link>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;
