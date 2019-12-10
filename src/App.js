import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { GraphQLClient, ClientContext } from "graphql-hooks";
import { SubscriptionClient } from "subscriptions-transport-ws";

// material-ui
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import theme from "./theme";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";

const client = new GraphQLClient({
  url: "https://subscriptions-chat-example-be.herokuapp.com/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "Password123!"
  },
  subscriptionClient: new SubscriptionClient(
    "wss://subscriptions-chat-example-be.herokuapp.com/v1/graphql",
    {
      reconnect: true,
      connectionParams: {
        headers: {
          "x-hasura-admin-secret": "Password123!"
        }
      }
    }
  )
});

function App() {
  return (
    <ClientContext.Provider value={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Switch>
            <Route path="/" exact>
              <HomePage />
            </Route>
            <Route path="/chat/:id" exact>
              <ChatPage />
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </ClientContext.Provider>
  );
}

export default App;
