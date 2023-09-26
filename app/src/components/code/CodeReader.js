import React, { useCallback, useEffect } from 'react'
import { Box, Heading } from '@chakra-ui/react';
import debounce from 'lodash.debounce';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CodeReader({
  inspectContract,
  handleCodeHover,
  handleCodeClick,
}) {

    const handleButtonAdd = (parent, event, remove) => {
      try {
        const highlighted = parent.querySelectorAll('.highlight');

        const button = document.createElement('button');
        button.innerText = 'Explain this function';
        button.classList.add('explain-button');
        button.style.position = 'absolute';
        button.style.top = '-50px';
        button.style.right = '-225px';
        button.style.zIndex = 110;
        button.addEventListener('click', () => handleCodeClick());

        if (highlighted.length === 0) {
          return;
        }


        if (highlighted.length > 0) {
          const wrapper = highlighted.forEach((element, i) => {
              if (i === 0) {
                  return element;
              }
          });
          highlighted[0].style.position = 'relative';
          highlighted[0].style.zIndex = 100;
          highlighted[0].appendChild(button);
        }
        if (remove) {
          console.log('remove button');
          highlighted[0].style.borderColor = 'transparent';
          highlighted[0].style.borderWidth = '0px';
          highlighted[0].removeChild(button);

        }
      } catch (error) {
          console.log('handleButtonAdd error', {error});
      }
    }

    const buttonAddCallback = useCallback(() => debounce(handleButtonAdd, 250), []);


    useEffect(() => {
      if (typeof window === 'undefined') return;
      const codeContainer = document.querySelector('.code-container');

      if (codeContainer) {
        codeContainer.addEventListener('mouseover', (event) => buttonAddCallback(handleButtonAdd(codeContainer, event), 250));
        codeContainer.addEventListener('mouseleave', (event) => buttonAddCallback(handleButtonAdd(codeContainer,event, true), 250));
      }

      return () => {
        if (codeContainer) {
          codeContainer.removeEventListener('mouseover', (event) => buttonAddCallback(codeContainer, event, true));
          codeContainer.removeEventListener('mouseleave', (event) => buttonAddCallback(codeContainer, event, true));
        }
      }

    }, []);


  return (
    <Box
      background="#101D42"
      w={{ base: 'full', lg: '50%' }}
      h="full"
      p={6}
      borderTopLeftRadius="lg"
      borderBottomLeftRadius="lg"
      onMouseOver={(event) => handleCodeHover(event)}
    >
      <Heading as="h3" size="md" noOfLines={1} pb={8}>
        SOURCE CODE
      </Heading>
          <Box
            className="code-container"
              h="sm" overflow="auto" sx={{
        "pre": {
          bgColor: '#101D42!important',
        }
      }}>
        <SyntaxHighlighter
          language="javascript"
          style={{
            ...dracula,
            display: 'inline-table',
            bgColor: '#101D42'
          }}
          onClick={() => handleCodeClick()}
          wrapLines={true}
        >
          {inspectContract?.sourceCode?.content || ''}
        </SyntaxHighlighter>
      </Box>
    </Box>
  )
}
