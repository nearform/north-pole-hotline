import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import { blue } from '@material-ui/core/colors';

const useStyles = makeStyles({
  list: {
    minWidth: 300
  },
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
});

export default function ChatUsersDialog(props) {
  const classes = useStyles();
  const { open, onClose, users } = props;

  return (
    <Dialog className={classes.root} aria-labelledby="chat-users" open={open} onClose={onClose}>
      <DialogTitle id="chat-users">Users</DialogTitle>
      <List className={classes.list}>
        {users.map(user => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={user.name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

ChatUsersDialog.propTypes = {
  open: PropTypes.bool.isRequired
};
