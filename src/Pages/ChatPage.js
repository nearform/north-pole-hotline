import React, { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { useSubscription, useMutation, useManualQuery } from "graphql-hooks";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";

// hooks
import useUser from '../hooks/useUser'

// components
import Header from "../components/Header";
import Snowfall from "../components/Snowfall";
import Message from "../components/Message";
import MessageComposer from "../components/MessageComposer";

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

const INITIAL_MESSAGES_QUERY = `
query InitialMessages($chatId: uuid!) {
  messages(where: {chat_id: { _eq: $chatId}}, order_by: { created_at: asc }) {
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
  INITIAL_MESSAGES_LOADED: "INITIAL_MESSAGES_LOADED",
  NEW_USER_ADDED: "NEW_USER_ADDED",
  NEW_MESSAGE: "NEW_MESSAGE",
  UPDATE_MESSAGE_TO_SEND: "UPDATE_MESSAGE_TO_SEND",
  MESSAGE_SENT: "MESSAGE_SENT",
  REPLACE_TEMP_MESSAGE: "REPLACE_TEMP_MESSAGE"
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ERROR:
      return {
        ...state,
        error: action.error
      };
    case ACTION_TYPES.INITIAL_MESSAGES_LOADED:
      return {
        ...state,
        messages: action.messages,
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
    default:
      return state;
  }
}

const useStyles = makeStyles(theme => ({
  messagesContainer: {
    height: "calc(85vh - 65px)",
    overflow: "scroll"
  }
}));

function ChatPage() {
  const user = useUser()
  const classes = useStyles();
  const { id: chatId } = useParams();
  const [state, dispatch] = useReducer(reducer, {
    chatId,
    fetchingMessages: true,
    error: null,
    tempMessageIndex: null,
    messages: [],
    user
  });

  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [addUserToChat] = useMutation(ADD_USER_TO_CHAT_MUTATION);

  const [fetchInitialMessages] = useManualQuery(INITIAL_MESSAGES_QUERY, {
    variables: {
      chatId
    }
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION);

  const subOperation = {
    query: LATEST_MESSAGE_SUBSCRIPTION,
    variables: {
      chatId,
      now: new Date().toISOString()
    }
  };

  useSubscription(subOperation, ({ data, errors }) => {
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

    dispatch({
      type: ACTION_TYPES.NEW_MESSAGE,
      message
    });
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

  const addNewUser = async event => {
    event.preventDefault();
    const name = event.target[0].value;
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
    fetchInitialMessages()
      .then(({ data, error }) => {
        if (error) {
          return dispatch({
            type: ACTION_TYPES.ERROR,
            error: new Error("GraphQL Error Occurred")
          });
        }

        dispatch({
          type: ACTION_TYPES.INITIAL_MESSAGES_LOADED,
          messages: data.messages
        });
      })
      .catch(error => {
        return dispatch({
          type: ACTION_TYPES.ERROR,
          error
        });
      });
  }, [fetchInitialMessages]);

  if (!state.user) {
    return (
      <form onSubmit={addNewUser}>
        <label>
          Your Name:
          <input type="text" name="name" placeholder="What's your name?" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }

  if (state.isLoading) {
    return <span>loading</span>;
  }

  return (
    <div className="">
      <Header />
      <Snowfall>
        <Container maxWidth="sm">
          {state.error && <span>An error occurred</span>}
          {state.messages.length === 0 && <span>No messages yet</span>}
          <div className={classes.messagesContainer}>
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
