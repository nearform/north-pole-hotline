import React, { useState } from "react";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import HomeIcon from "@material-ui/icons/Home";

// hooks
import useChats from "../hooks/useChats";

// components
import Link from "./Link";

const useStyles = makeStyles(theme => ({
  root: {
    height: 65
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

export default function ButtonAppBar(props) {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    refetch();
    setDrawerOpen(!drawerOpen);
  };

  const { loading, data, refetch } = useChats();

  const chats = data ? data.users_by_pk.chats : [];

  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="inherit">
        <Drawer open={drawerOpen} onClose={toggleDrawer}>
          <List>
            <Link to="/" underline="none" color="inherit" onClick={toggleDrawer}>
              <ListItem>
                <ListItemIcon>
                  <HomeIcon color="secondary" />
                </ListItemIcon>
                <ListItemText>Home</ListItemText>
              </ListItem>
            </Link>
            <Divider />
            <ListItem>
              <ListItemText>Chats:</ListItemText>
            </ListItem>
            {loading && <ListItemText>Loading...</ListItemText>}
            {chats.map(({ chat }) => (
              <ListItem key={chat.id} onClick={toggleDrawer}>
                <Link to={`/chat/${chat.id}`}>
                  <ListItemText>{chat.name || chat.id}</ListItemText>
                </Link>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            <MenuIcon color="secondary" />
          </IconButton>
          {props.children}
        </Toolbar>
      </AppBar>
    </div>
  );
}
