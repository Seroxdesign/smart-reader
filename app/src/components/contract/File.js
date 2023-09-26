import { Badge, ListItem, Text } from '@chakra-ui/react';

export const File = ({ file: { name, selected, dependency }, handleClick }) => {
  return (
    <ListItem
      bgColor={selected ? '#5B6D9F' : 'transparent'}
      border="2px solid #FFFFFF33"
      p={3}
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      className="contract-dependency"
      onClick={(e) => handleClick(e)}
      cursor="pointer"
      _hover={{ background: '#ffffff40' }}
    >
          <Text
              as="span"
        data-contract-name={name}
        className="dependency-name"
        pointerEvents="none"
      >
        {name}
      </Text>
      {dependency && (
        <Badge
          ml="1"
          fontSize="0.8em"
          background="#FFFFFF1A"
          color="white"
          p={1.5}
          borderRadius="md"
          pointerEvents="none"
        >
          <Text fontWeight={400}>DEPENDENCY</Text>
        </Badge>
      )}
    </ListItem>
  );
};
