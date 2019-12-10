import React, { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSubscription, useMutation, useManualQuery } from "graphql-hooks";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

// hooks
import useUser from "../hooks/useUser";

// components
import Header from "../components/Header";
import Snowfall from "../components/Snowfall";
import Snowman from "../components/Snowman";
import Message from "../components/Message";
import MessageComposer from "../components/MessageComposer";
import ChatUsersDialog from "../components/ChatUsersDialog";
import InviteDialog from "../components/InviteDialog";
import NewUserNotification from "../components/NewUserNotification";
import JoinChatDialog from "../components/JoinChatDialog";

const ADD_USER_TO_CHAT_MUTATION = `
mutation AddUserToChat($chatId: uuid!, $userId: uuid!) {
  insert_chat_users(objects: [{chat_id: $chatId, user_id: $userId}], on_conflict: {constraint: chat_users_pkey, update_columns: []}) {
    affected_rows
  }
}
`;

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

const CHAT_INFO_QUERY = `
query GetChatInfo($id: uuid!) {
  chats_by_pk(id: $id) {
    id
    name
    messages(where: {chat_id: {_eq: $id}}, order_by: {created_at: asc}) {
      id
      body
      user {
        id
        name
      }
      created_at
    }
    users {
      user {
        id
        name
      }
    }
  }
}

`;

const LATEST_MESSAGE_SUBSCRIPTION = `
subscription LatestMessage($chatId: uuid!, $now: timestamptz!) {
  messages(where: {chat_id: {_eq: $chatId}, created_at: {_gt: $now}}, order_by: {created_at: desc}, limit: 1) {
    id
    body
    user {
      id
      name
    }
    created_at
  }
}
`;

const NEW_USER_SUBSCRIPTION = `
subscription NewChatUser($chatId: uuid!, $now: timestamptz!) {
  chat_users(where: {chat_id: {_eq: $chatId}, created_at: {_gt: $now}}, order_by: {created_at: desc}, limit: 1) {
    user {
      id
      name
    }
  }
}
`;

const SEND_MESSAGE_MUTATION = `
mutation SendMessage($message: messages_insert_input!) {
  insert_messages(objects: [$message]) {
    returning {
      id
      body
      user {
        id
        name
      }
      created_at
    }
  }
}
`;

const ACTION_TYPES = {
  ERROR: "ERROR",
  CHAT_LOADED: "CHAT_LOADED",
  NEW_USER_ADDED: "NEW_USER_ADDED",
  USER_JOINED_CHAT: "USER_JOINED_CHAT",
  NEW_MESSAGE: "NEW_MESSAGE",
  UPDATE_MESSAGE_TO_SEND: "UPDATE_MESSAGE_TO_SEND",
  MESSAGE_SENT: "MESSAGE_SENT",
  REPLACE_TEMP_MESSAGE: "REPLACE_TEMP_MESSAGE",
  OPEN_USERS_DIALOG: "OPEN_USERS_DIALOG",
  CLOSE_USERS_DIALOG: "CLOSE_USERS_DIALOG",
  OPEN_INVITE_DIALOG: "OPEN_INVITE_DIALOG",
  CLOSE_INVITE_DIALOG: "CLOSE_INVITE_DIALOG",
  CLOSE_NEW_USER_SNACKBAR: "CLOSE_NEW_USER_SNACKBAR"
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ERROR:
      return {
        ...state,
        error: action.error
      };
    case ACTION_TYPES.CHAT_LOADED:
      return {
        ...state,
        messages: action.messages,
        chatName: action.chatName,
        users: action.users,
        fetchingMessages: false
      };
    case ACTION_TYPES.NEW_USER_ADDED:
      return {
        ...state,
        user: action.user
      };
    case ACTION_TYPES.NEW_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.message]
      };
    case ACTION_TYPES.MESSAGE_SENT:
      return {
        ...state,
        tempMessageIndex: state.messages.length,
        messages: [...state.messages, action.message]
      };
    case ACTION_TYPES.REPLACE_TEMP_MESSAGE:
      return {
        ...state,
        tempMessageIndex: null,
        messages: state.messages.map(msg => {
          return msg.id === "temp" ? action.message : msg;
        })
      };
    case ACTION_TYPES.USER_JOINED_CHAT:
      return {
        ...state,
        users: [...state.users, action.user],
        newUserJoined: action.user,
        isNewUserJoinedSnackbarOpen: action.user.id !== state.user.id
      };
    case ACTION_TYPES.OPEN_INVITE_DIALOG:
      return {
        ...state,
        isInviteDialogOpen: true
      };
    case ACTION_TYPES.CLOSE_INVITE_DIALOG:
      return {
        ...state,
        isInviteDialogOpen: false
      };
    case ACTION_TYPES.OPEN_USERS_DIALOG:
      return {
        ...state,
        isUsersDialogOpen: true
      };
    case ACTION_TYPES.CLOSE_USERS_DIALOG:
      return {
        ...state,
        isUsersDialogOpen: false
      };
    case ACTION_TYPES.CLOSE_NEW_USER_SNACKBAR:
      return {
        ...state,
        newUserJoined: null,
        isNewUserJoinedSnackbarOpen: false
      };
    default:
      return state;
  }
}

const useStyles = makeStyles(theme => ({
  userList: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline"
    }
  },
  centerChannel: {
    zIndex: 10
  },
  messagesContainer: {
    height: "calc(80vh - 60px)",
    overflow: "scroll"
  },
  newUserJoinedSB: {
    backgroundColor: theme.palette.primary.main
  },
  snowman: {
    position: "absolute",
    left: 50,
    bottom: 200
  }
}));

function ChatPage() {
  const messageContainerRef = useRef();
  const user = useUser();
  const classes = useStyles();
  const { id: chatId } = useParams();
  const [state, dispatch] = useReducer(reducer, {
    chatId,
    fetchingMessages: true,
    error: null,
    tempMessageIndex: null,
    messages: [],
    chatName: "loading...",
    user,
    users: [],
    isInviteDialogOpen: false,
    isUsersDialogOpen: false,
    isNewUserJoinedSnackbarOpen: false,
    newUserJoined: null
  });

  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [addUserToChat] = useMutation(ADD_USER_TO_CHAT_MUTATION);

  const [fetchChatInfo] = useManualQuery(CHAT_INFO_QUERY, {
    variables: {
      id: chatId
    }
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION);

  const latestMsgOperation = {
    query: LATEST_MESSAGE_SUBSCRIPTION,
    variables: {
      chatId,
      now: new Date().toISOString()
    }
  };

  useSubscription(latestMsgOperation, ({ data, errors }) => {
    if (errors) {
      return dispatch({
        type: ACTION_TYPES.ERROR,
        error: errors[0]
      });
    }

    const message = data.messages[0];

    if (!message) {
      return;
    }

    const tempMessage = state.messages[state.tempMessageIndex];

    if (
      tempMessage &&
      message.body === tempMessage.body &&
      message.user.id === tempMessage.user.id
    ) {
      return dispatch({
        type: ACTION_TYPES.REPLACE_TEMP_MESSAGE,
        message
      });
    }

    const alreadyExists = state.messages.some(({ id }) => id === message.id)

    if (!alreadyExists) {
      dispatch({
        type: ACTION_TYPES.NEW_MESSAGE,
        message
      });
    }
  });

  const userJoinedOperation = {
    query: NEW_USER_SUBSCRIPTION,
    variables: {
      chatId,
      now: new Date().toISOString()
    }
  };

  useSubscription(userJoinedOperation, ({ data, errors }) => {
    if (errors) {
      return dispatch({
        type: ACTION_TYPES.ERROR,
        error: errors[0]
      });
    }

    if (!data.chat_users.length) {
      return;
    }

    const { user } = data.chat_users[0];

    const alreadyExists = state.users.some(({ id }) => id === user.id)

    if (!alreadyExists) {
      dispatch({
        type: ACTION_TYPES.USER_JOINED_CHAT,
        user
      });
    }
  });

  const handleSendMessage = async body => {
    if (!body) {
      return;
    }

    dispatch({
      type: ACTION_TYPES.MESSAGE_SENT,
      message: {
        id: "temp",
        chat_id: state.chatId,
        user_id: state.user.id,
        body,
        user: state.user
      }
    });

    await sendMessage({
      variables: {
        message: {
          body,
          chat_id: state.chatId,
          user_id: state.user.id
        }
      }
    });
  };

  const addNewUser = async name => {
    try {
      const { data } = await createUser({ variables: { user: { name } } });
      const [user] = data.insert_users.returning;

      localStorage.setItem("chat-app-user", JSON.stringify(user));

      await addUserToChat({
        variables: {
          chatId: state.chatId,
          userId: user.id
        }
      });

      dispatch({
        type: ACTION_TYPES.NEW_USER_ADDED,
        user
      });
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.ERROR,
        error
      });
    }
  };

  const openInviteDialog = () =>
    dispatch({ type: ACTION_TYPES.OPEN_INVITE_DIALOG });

  const closeInviteDialog = () =>
    dispatch({ type: ACTION_TYPES.CLOSE_INVITE_DIALOG });

  const openUsersDialog = () =>
    dispatch({ type: ACTION_TYPES.OPEN_USERS_DIALOG });
  const closeUsersDialog = () =>
    dispatch({ type: ACTION_TYPES.CLOSE_USERS_DIALOG });

  const closeNewUserJoinedSnackbar = () => {
    dispatch({ type: ACTION_TYPES.CLOSE_NEW_USER_SNACKBAR });
  };

  // handle upserting the user to the chat
  useEffect(() => {
    if (state.user) {
      addUserToChat({
        variables: {
          chatId: state.chatId,
          userId: state.user.id
        }
      });
    }
  }, [state.user, state.chatId, addUserToChat]);

  // fetch the initial messages
  useEffect(() => {
    fetchChatInfo()
      .then(({ data, error }) => {
        if (error) {
          return dispatch({
            type: ACTION_TYPES.ERROR,
            error: new Error("GraphQL Error Occurred")
          });
        }

        dispatch({
          type: ACTION_TYPES.CHAT_LOADED,
          messages: data.chats_by_pk.messages,
          chatName: data.chats_by_pk.name,
          users: data.chats_by_pk.users.map(u => u.user)
        });
      })
      .catch(error => {
        return dispatch({
          type: ACTION_TYPES.ERROR,
          error
        });
      });
  }, [fetchChatInfo]);

  useEffect(() => {
    if (
      messageContainerRef &&
      messageContainerRef.current &&
      messageContainerRef.current.scroll
    ) {
      messageContainerRef.current.scroll({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [state.messages]);

  if (!state.user) {
    return (
      <JoinChatDialog
        chatName={state.chatName || state.chatId}
        onSubmit={addNewUser}
      />
    );
  }

  return (
    <div className="root">
      <Header>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={9} sm={10} md={8}>
            <Typography variant="h6" align="center">
              {state.chatName}
            </Typography>

            {state.users.length > 0 && (
              <Typography
                variant="subtitle1"
                align="center"
                className={classes.userList}
                onClick={openUsersDialog}
              >
                {state.users.map(({ name }) => name).join(", ")}
              </Typography>
            )}
          </Grid>
          <Grid item xs={3} sm={2} md={4}>
            <Box display="flex" height="100%" justifyContent="flex-end">
              <Hidden mdUp>
                <IconButton
                  aria-label="add-new-user"
                  onClick={openInviteDialog}
                >
                  <PersonAddIcon color="primary" />
                </IconButton>
              </Hidden>

              <Hidden smDown>
                <Button
                  variant="contained"
                  fullWidth={false}
                  color="primary"
                  onClick={openInviteDialog}
                >
                  Invite
                </Button>
              </Hidden>
            </Box>
          </Grid>
        </Grid>
      </Header>
      <ChatUsersDialog
        users={state.users}
        open={state.isUsersDialogOpen}
        onClose={closeUsersDialog}
      />
      <InviteDialog
        url={window.location.href}
        open={state.isInviteDialogOpen}
        onClose={closeInviteDialog}
      />
      <NewUserNotification
        open={state.isNewUserJoinedSnackbarOpen}
        onClose={closeNewUserJoinedSnackbar}
        user={state.newUserJoined}
      />
      <Snowfall>
        <Hidden mdDown>
          <Box className={classes.snowman}>
            <Snowman />
          </Box>
        </Hidden>
        <Container maxWidth="sm" className={classes.centerChannel}>
          {state.error && <span>An error occurred</span>}
          <div className={classes.messagesContainer} ref={messageContainerRef}>
            {state.messages.map(m => {
              return (
                <Box my={2} key={m.id}>
                  <Message
                    {...m}
                    sentByCurrentUser={m.user.id === state.user.id}
                  />
                </Box>
              );
            })}
          </div>
          <MessageComposer onSubmit={handleSendMessage} />
        </Container>
      </Snowfall>
    </div>
  );
}

export default ChatPage;
