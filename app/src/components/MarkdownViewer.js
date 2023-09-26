import {
	Box,
	Code,
	Divider,
	Heading,
	Image,
	Link,
	Spacer,
	Table,
	Text,
	Th,
} from '@chakra-ui/react';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import React from 'react';
import ReactMarkdown from 'react-markdown';

const heading = (props) => {
  const { level } = props;
  const sizes = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  return (
    <Heading
      my={4}
      as={`h${level}`}
      size={sizes[level - 1]}
      fontFamily="body"
      {...props}
    />
  );
};

const markdownTheme = {
  a: ({ href, ...props }) => <Link isExternal href={href ?? '#'} {...props} />,
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  hr: () => <Divider borderBottomWidth="4px" my={2} />,
  blockquote: ({ children }) => (
    <Box
      w="full"
      as="blockquote"
      p={2}
      pb="1px"
      borderLeft="4px solid"
      borderColor="inherit"
      my={2}
    >
      {children}
    </Box>
  ),
  table: (props) => <Table w="auto" {...props} />,
  th: ({ children }) => <Th fontFamily="body">{children}</Th>,
  br: () => <Spacer />,
  img: (props) => <Image w="full" {...props} />,
  p: ({ children, ...props }) => (
    <Text mb={2} {...props}>
      {children}
    </Text>
  ),
  code: ({ inline, ...props }) => {
    if (inline) {
      return <Code {...props} />;
    }

    return (
      <Code
        whiteSpace="break-spaces"
        display="block"
        w="full"
        px={4}
        py={2}
        my={2}
        {...props}
      />
    );
  },
};

const Viewer = ({ children }) => (
  <Box w="full" color="white">
    <ReactMarkdown
      components={{ ...ChakraUIRenderer(), ...markdownTheme }}
      skipHtml
    >
      {children}
    </ReactMarkdown>
  </Box>
);

export default Viewer;
