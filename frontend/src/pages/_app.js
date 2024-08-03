// pages/_app.js

import Navbar from "@/features/components/navbar";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/features/components/footer";
import { Box } from "@chakra-ui/react";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Navbar />
          <Box flex="1">
            <Component {...pageProps} />
          </Box>
          <Footer />
        </Box>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
