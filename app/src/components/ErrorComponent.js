import { Button, Flex, Heading, Link, Text, VStack, HStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import { Icon } from "@iconify/react";
import { Link as RouterLink } from "react-router-dom";
import { errorHandler } from "../utils/helpers";


export const ErrorComponent = () => {
  const [hasError, setHasError] = useState(false);

  const handleTryAgain = () => {
    setHasError(false);
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <VStack align="center" justify="center" h="100vh" maxW="3xl" p={4} color="white" gap={16}>
      <HStack gap={1} alignItems="center">
        <Icon icon="icon-park-solid:emotion-unhappy" h={16} w={16} />
        <Heading as="h1" size="lg" fontWeight={600} noOfLines={1}>Sorry... there was an error</Heading>
      </HStack>

      <Text as="p">
        The application encountered an unexpected error. Please click the
        button below to reload the application or go back to the home page.
      </Text>
      <Flex gap={3} w={["full", "auto"]}>
        <Button
          background="transparent"
          color="whiteAlpha.700"
          _hover={{ background: 'transparent', color: 'white' }}
          border="2px solid white"
          borderRadius="full"
          px={5}
          py={3}
          onClick={handleTryAgain}
          size={["md", "lg"]}
        >
          Reload Page
        </Button>
        <Link as={RouterLink}
          to="/"
          background="whiteAlpha.500"
          color="whiteAlpha.700"
          _hover={{ background: 'transparent', color: 'white' }}
          border="2px solid white"
          borderRadius="full" onClick={handleGoHome} size={["md", "lg"]}>
          Go to Home Page
        </Link>
      </Flex>
    </VStack>
  );
}
