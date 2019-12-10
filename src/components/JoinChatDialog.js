import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function JoinChatDialog(props) {
  const { chatName, onSubmit } = props;
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");

  const joinChat = async () => {
    if (name) {
      await onSubmit(name);
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={joinChat}
      aria-labelledby="join-chat-dialog-title"
    >
      <DialogTitle id="join-chat-dialog-title">Join {chatName}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Your Name"
          type="text"
          autoComplete="name"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={joinChat}
          disabled={!name}
          color="primary"
          variant="contained"
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}
