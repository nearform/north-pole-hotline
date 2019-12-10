import React, { useState } from "react";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Grid from "@material-ui/core/Grid";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
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
    height: 56
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

  const homepageGridItem = (
    <Grid item xs={12}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer}
      >
        <MenuIcon color="secondary" />
      </IconButton>
      <Typography variant="h6" display="inline" role="img" aria-label="title">
        North Pole Hotline <span role="img" aria-label="wrapped-gift-emoji">🎁</span>
      </Typography>
    </Grid>
  );

  const chatGridItem = (
    <Grid item xs={2} sm={1} md={3}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer}
      >
        <MenuIcon color="secondary" />
      </IconButton>
      <Hidden smDown>
        <Typography variant="h6" display="inline">
          North Pole Hotline <span role="img" aria-label="wrapped-gift-emoji">🎁</span>
        </Typography>
      </Hidden>
    </Grid>
  );

  const firstGridItem = props.isHomePage ? homepageGridItem : chatGridItem;

  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="inherit">
        <Drawer open={drawerOpen} onClose={toggleDrawer}>
          <List>
            <Link
              to="/"
              underline="none"
              color="inherit"
              onClick={toggleDrawer}
            >
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
          <Grid container alignItems="center">
            {firstGridItem}
            <Grid item xs={10} sm={11} md={9}>
              {props.children}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
