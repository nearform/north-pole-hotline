import React, { useState } from "react";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#FFFFFF"
  }
}));

export default function MessageComposer(props) {
  const classes = useStyles();
  const { onSubmit } = props;
  const [message, setMessage] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(message);
    setMessage("");
  };

  return (
    <Box padding={2} bgcolor="white">
      <Box display="flex">
        <Box flexGrow={1}>
          <TextField
            className={classes.root}
            label="Your message"
            variant="standard"
            multiline
            fullWidth
            rows="1"
            rowsMax="2"
            value={message}
            onChange={event => setMessage(event.target.value)}
            onKeyDown={event => { if (event.key === "Enter") { handleSubmit(event) }}}
          />
        </Box>
        <Box>
          <IconButton color="primary" aria-label="send" onClick={handleSubmit}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
