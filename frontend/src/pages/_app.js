import Navbar from "@/features/components/navbar";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Navbar/>
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>

  );
}
