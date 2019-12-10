import React, { Component } from 'react'
import { Link as RRLink } from 'react-router-dom'
import MuiLink from '@material-ui/core/Link'

const Link = React.forwardRef((props, ref) => (
  <RRLink innerRef={ref} {...props} />
))

class AppLink extends Component {
  render() {
    return <MuiLink underline="always" color
    ="primary" component={Link} {...this.props} />
  }
}

export default AppLink