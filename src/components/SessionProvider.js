import React, { createContext, useReducer, useContext, useEffect } from "react";
import { ClientContext, useManualQuery, useMutation } from "graphql-hooks";
import jwtDecode from "jwt-decode";
import { useHistory, useLocation } from "react-router-dom";

// helpers
import { graphQLError } from "../helpers/graphql-errors";

const loginStub = () => Promise.reject(new Error("not implemented"));

const FETCH_USER_QUERY = `
  query FetchUser($id: uuid!) {
    users_by_pk(id: $id) {
      id
      email
      created_at
      updated_at
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($user: users_insert_input!) {
    insert_users(objects: [$user]) {
      returning {
        id
        email
        created_at
        updated_at
      }
    }
  }
`;

export const SessionContext = createContext();

const ACTION_TYPES = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOADING: "LOADING",
  LOADING_COMLETE: "LOADING_COMLETE"
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.LOADING:
      return {
        ...state,
        loading: true
      };
    case ACTION_TYPES.LOADING_COMLETE:
      return {
        ...state,
        loading: false
      };
    case ACTION_TYPES.LOGIN:
      return {
        ...state,
        user: action.user,
        loading: false
      };
    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        loading: false
      };
    default:
      return state;
  }
};

export default function SessionProvider(props) {
  const history = useHistory();
  const location = useLocation();
  const gqlClient = useContext(ClientContext);
  const [fetchUser] = useManualQuery(FETCH_USER_QUERY);
  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    loading: true
  });

  const login = async (username, password) => {
    try {
      const jwt = await loginStub(username, password);
      return loginWithJWT(jwt);
    } catch (error) {
      console.error(error);
      // re-throw for consumer
      throw error;
    }
  };

  const loginWithJWT = async jwt => {
    let decodedJWT;
    let userId;
    try {
      decodedJWT = jwtDecode(jwt);
    } catch (error) {
      return Promise.reject(new Error("Invalid JWT"));
    }

    try {
      userId = decodedJWT["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    } catch (error) {
      return Promise.reject(
        new Error("Missing [x-hasura-user-id] in https://hasura.io/jwt/claims")
      );
    }

    gqlClient.setHeader("Authorization", `Bearer ${jwt}`);

    const { error, data } = await fetchUser({
      variables: {
        id: userId
      }
    });

    if (error) {
      return Promise.reject(graphQLError(error));
    }

    if (data && data.users_by_pk) {
      window.localStorage.setItem("jwt", jwt);

      dispatch({
        type: ACTION_TYPES.LOGIN,
        user: data.users_by_pk
      });

      if (location.pathname === "/login") {
        history.replace("/");
      }
    } else {
      const email =
        decodedJWT["https://hasura.io/jwt/claims"]["x-hasura-user-email"];

      const { error, data } = await createUser({
        variables: {
          user: {
            id: userId,
            email: email || null
          }
        }
      });

      if (error) {
        return Promise.reject(graphQLError(error));
      }

      const user = data.insert_users.returning[0];

      dispatch({
        type: ACTION_TYPES.LOGIN,
        user
      });

      if (location.pathname === "/login") {
        history.replace("/");
      }
    }
  };
  const logout = () => {
    window.localStorage.removeItem("jwt");
    dispatch({
      type: ACTION_TYPES.LOGOUT
    });
  };

  const providerValue = {
    login,
    loginWithJWT,
    logout,
    ...state
  };

  useEffect(() => {
    const preexistingJWT = window.localStorage.getItem("jwt");
    if (preexistingJWT) {
      loginWithJWT(preexistingJWT).finally(() => {
        dispatch({ type: ACTION_TYPES.LOADING_COMLETE });
      });
    } else {
      dispatch({ type: ACTION_TYPES.LOADING_COMLETE });
    }

    // eslint-disable-next-line
  }, []);

  return (
    <SessionContext.Provider value={providerValue}>
      {props.children}
    </SessionContext.Provider>
  );
}
