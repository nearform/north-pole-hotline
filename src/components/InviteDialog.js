import React from "react";
import PropTypes from "prop-types";

// material-ui
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

export default function InviteDialog(props) {
  const { open, onClose, url } = props;

  return (
    <Dialog
      aria-labelledby="invite-dialog"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Invite Anyone</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Share this link with anyone you'd like to join the chat
        </DialogContentText>
        <DialogContentText color="primary">
        {url}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

InviteDialog.propTypes = {
  url: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
