import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { GraphQLClient, ClientContext } from "graphql-hooks";
import { SubscriptionClient } from "subscriptions-transport-ws";

import "./App.css";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";

const client = new GraphQLClient({
  url: "https://subscriptions-chat-example-be.herokuapp.com/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "Password123!"
  },
  subscriptionClient: new SubscriptionClient("wss://subscriptions-chat-example-be.herokuapp.com/v1/graphql", {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": "Password123!"
      }
    }
  })
});

function App() {
  return (
    <ClientContext.Provider value={client}>
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
    </ClientContext.Provider>
  );
}

export default App;
