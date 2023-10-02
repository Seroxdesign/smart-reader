import { Box, Heading, List, Stack } from '@chakra-ui/react';
import { File } from './File';

export const Files = ({ sourceCode, selectedContract, handleClick }) => {
  return (
    <Stack>
      <Heading as="h2" size="md" fontWeight={600} noOfLines={1}>
        FILES ({sourceCode.length})
      </Heading>
      <Box
        position="relative"
        maxH="280px"
        overflowY="auto"
        overflowX="hidden"
        mt={2}
        mb={4}
        pb={2}
        pr={2}
        borderRadius="xl"
        scrollBehavior="smooth"
      >
        <List spacing={1}>
          {sourceCode &&
            sourceCode.length > 0 &&
            sourceCode.map((contract) => {
              const contractName = contract.name;
              const file = {
                name: contractName,
                selected: contractName.indexOf(selectedContract) >= 0,
                dependency: true,
              };
              return (
                <File
                  key={contractName}
                  file={file}
                  handleClick={handleClick}
                />
              );
            })}
        </List>
      </Box>
    </Stack>
  );
};
