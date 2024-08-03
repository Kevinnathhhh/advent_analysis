// components/Footer.js

import { Box, Text, Stack, Link, useColorModeValue, Center } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box
          bg={useColorModeValue('gray.100', 'gray.900')}
          color={useColorModeValue('gray.700', 'gray.200')}
          py={4}
          px={8}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Text textAlign="center">&copy; {new Date().getFullYear()} School Advent Salemba. All rights reserved.</Text>
          </Stack>
        </Box>
      );
};

export default Footer;
