import { useState, useEffect, useContext, createContext } from "react";
import {
  BrowserOAuthClient,
  OAuthSession,
} from "@atproto/oauth-client-browser";

/*
 * This file defines a React context, provider component,
 * and hook for using the AT Protocol browser-based OAuth client.
 */

const oAuthContext = createContext<{
  client: BrowserOAuthClient | undefined;
  session: OAuthSession | undefined;
}>({ client: undefined, session: undefined });

export function OAuthProvider({ children }: any) {
  // "client" is the browser OAuth client instance
  const [client, setClient] = useState<BrowserOAuthClient>();
  // "session" holds the current session data (if logged-in)
  const [session, setSession] = useState<OAuthSession>();
  // The "loading" state is used to control execution of the init effect below
  const [loading, setLoading] = useState(false);

  // Initialize browser OAuth client and store session data if logged-in
  useEffect(
    function () {
      // Only run if client does not exist and is not currently loading
      if (!loading && !client) {
        setLoading(true);

        // Load ATProto OAuth client using metadata JSON file (generated in vite.config.js)
        BrowserOAuthClient.load({
          clientId: `http://supply-library-v2/client-oauth-metadata.json`,
          // https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-browser#handle-resolver
          handleResolver: "https://bsky.social",
        }).then(function (client) {
          // Initialize client
          client.init().then((result) => {
            if (result?.session) {
              // Save current session if logged-in
              setSession(result.session);
            }

            // Save client
            setClient(client);
            setLoading(false);
          });
        });
      }
    },
    [client, loading]
  );

  return (
    <oAuthContext.Provider
      value={{
        client,
        session,
      }}
    >
      {children}
    </oAuthContext.Provider>
  );
}

export function useOAuth() {
  return useContext(oAuthContext);
}
