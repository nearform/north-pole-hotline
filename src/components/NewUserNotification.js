import React from "react";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => ({
  content: {
    backgroundColor: theme.palette.primary.main
  }
}));

export default function NewUserNotification(props) {
  const classes = useStyles();
  const { open, onClose, user } = props;

  return (
    <Snackbar
      autoHideDuration={2000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      onClose={onClose}
      ContentProps={{
        "aria-describedby": "new user added"
      }}
    >
      <SnackbarContent
        className={classes.content}
        message={
          <Typography variant="button">
            {user ? `${user.name} Joined` : ""}
          </Typography>
        }
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </Snackbar>
  );
}
