import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(1, 2)
  },
  cardContent: {
    padding: 0,
    '&:last-child': {
      padding: 0
    }
  },
  userName: {
    fontSize: 14
  }
}));

export default function Message(props) {
  const classes = useStyles();
  const { body, user, created_at, sentByCurrentUser } = props;

  const nowDate = new Date()
  debugger;
  const sentDate = new Date(created_at);
  const wasSentToday = nowDate.toDateString() === sentDate.toDateString()
  const sentTime = wasSentToday ? sentDate.toLocaleTimeString() : sentDate.toLocaleString()

  return (
    <Card className={classes.card} style={{
      marginLeft: sentByCurrentUser ? 40 : 0,
      marginRight: sentByCurrentUser ? 0 : 40
    }}>
      <CardContent className={classes.cardContent}>
        <Typography
          className={classes.userName}
          color="textSecondary"
          gutterBottom
        >
          {user.name}
        </Typography>
        <Typography variant="body1" component="p">
          {body}
        </Typography>
        <Typography variant="body2" align="right" component="p">
          {sentTime === "Invalid Date" ? '...' : sentTime}
        </Typography>
      </CardContent>
    </Card>
  );
}
