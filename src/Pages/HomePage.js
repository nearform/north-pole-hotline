import React, { useState } from "react";
import { useMutation } from "graphql-hooks";
import { useHistory } from "react-router-dom";

// material-ui
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";

// components
import Header from "../components/Header";
import Snowman from "../components/Snowman";
import Snowfall from "../components/Snowfall";

// helpers
import generateChatName from "../helpers/generate-chat-name";

const CREATE_USER_MUTATION = `
mutation CreateUser($user: users_insert_input!) {
  insert_users(objects: [$user]) {
    returning {
      id
      name
    }
  }
}
`;

const CREATE_CHAT_MUTATION = `
mutation CreateChat($name: String) {
  insert_chats(objects: [{ name: $name }]) {
    returning {
      id
    }
  }
}
`;

const ADD_USER_TO_CHAT_MUTATION = `
mutation AddUserToChat($chatId: uuid!, $userId: uuid!) {
  insert_chat_users(objects: [{chat_id: $chatId, user_id: $userId}], on_conflict: {constraint: chat_users_pkey, update_columns: []}) {
    affected_rows
  }
}
`;

const LS_USER_KEY = "chat-app-user";
const existingUser = localStorage.getItem("chat-app-user");

function HomePage() {
  const history = useHistory();
  // eslint-disable-next-line
  const [error, setError] = useState();
  const [name, setName] = useState(existingUser ? existingUser.name : "");
  const [createChat] = useMutation(CREATE_CHAT_MUTATION);
  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [addUserToChat] = useMutation(ADD_USER_TO_CHAT_MUTATION);

  const handleSubmit = async event => {
    event.preventDefault();

    try {
      const [chatResult, userResult] = await Promise.all([
        createChat({ variables: { name: generateChatName() } }),
        createUser({ variables: { user: { name } } })
      ]);

      if (chatResult.error || userResult.error) {
        setError(new Error("Something bad happened"));
        return;
      }

      const chat = chatResult.data.insert_chats.returning[0];
      const user = userResult.data.insert_users.returning[0];

      const { error } = await addUserToChat({
        variables: {
          chatId: chat.id,
          userId: user.id
        }
      });

      if (error) {
        setError(new Error("Something bad happened"));
        return;
      }

      // all good
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      history.push(`/chat/${chat.id}`);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <Header isHomePage />
      <Snowfall>
        <main>
          <Box pt={8}>
            <Typography variant="h4" align="center">
              Keep those special moments secret
            </Typography>
          </Box>
          <Box mt={4}>
            <Typography variant="h5" align="center">
              Start a private chat now:
            </Typography>
          </Box>
          <Box mt={4}>
            <Container maxWidth="xs" mt={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} lg={6}>
                  <TextField
                    size="normal"
                    label="Your Name"
                    variant="outlined"
                    type="text"
                    autoComplete="name"
                    value={name}
                    fullWidth
                    onChange={e => setName(e.target.value)}
                    style={{ backgroundColor: "white" }}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    color="primary"
                    style={{ height: "100%" }}
                    onClick={handleSubmit}
                    disabled={!name}
                  >
                    Chat now
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>
          <Hidden smDown>
            <Container maxWidth="xs">
              <Snowman />
            </Container>
          </Hidden>
        </main>
      </Snowfall>
    </div>
  );
}

export default HomePage;
