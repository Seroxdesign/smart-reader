// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  fonts: {
    heading: `'Figtree', sans-serif`,
    body: `'Figtree', sans-serif`,
    },
    colors: {
        link: '#A4BCFF'
    }
})

export default theme
