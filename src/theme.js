import { createMuiTheme } from '@material-ui/core/styles'

import { green, red } from '@material-ui/core/colors'

const customColors = {
  green: green[700],
  red: red[700]
}

const theme = createMuiTheme({
  palette: {
    customColors,
    primary: {
      main: green[700]
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: red[700]
    }
  }
})

export default theme
