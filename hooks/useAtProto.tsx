import { useState, useEffect, createContext, useContext } from "react";
import { Agent } from "@atproto/api";

// import { UsPolhemAtprotoStarterNS } from "../__generated__/lexicons";
import { useOAuth } from "@/hooks/useOauth";
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

/*
 * This file defines a React context, provider component,
 * and hook for using the AT Protocol API Agent.
 */

const atProtoContext = createContext({});

export function ATProtoProvider({ children }: any) {
  // Get OAuth client and session (configured in src/hooks/oauth.jsx)
  const { client: oAuthClient, session } = useOAuth();

  // "agent" is the primary API client for handling common ATProto and Bluesky resources
  const [agent, setAgent] = useState<Agent>();
  // "atprotoStarter" is an API client for handling lexicons specific to this app
  const [atProtoStarter, setAtProtoStarter] = useState();
  // We fetch the logged-in user's profile automatically and store it as "accountProfile"
  const [accountProfile, setAccountProfile] = useState<ProfileViewDetailed>();
  // The "loading" state is used to control execution of the init effect below
  const [loading, setLoading] = useState(false);

  // Initialize ATProto agent and fetch account profile if logged-in
  useEffect(
    function () {
      // Wait for OAuth client to initialize, and only run if agent does not exist and is not currently loading
      if (oAuthClient && !agent && !loading) {
        setLoading(true);

        if (session && session.sub) {
          // Initialize authenticated agent using OAuth session
          const agentWithSession = new Agent(session);

          // Fetch logged-in user profile automatically
          agentWithSession
            .getProfile({ actor: session.sub })
            .then((response) => {
              setAccountProfile(response.data);
              setAgent(agentWithSession);
              //   setAtProtoStarter(new UsPolhemAtprotoStarterNS(agentWithSession));
              setLoading(false);
            });
        } else {
          // Fall back to unauthenticated agent using cache-enabled public.api.bsky.app endpoints
          setAgent(new Agent("https://public.api.bsky.app"));
          // Use non-cached bsky.social endpoints for reading from custom lexicon collections
          //   setAtProtoStarter(
          //     new UsPolhemAtprotoStarterNS(new Agent("https://bsky.social"))
          //   );
          setLoading(false);
        }
      }
    },
    [oAuthClient, agent, session, loading]
  );

  return (
    <atProtoContext.Provider value={{ agent, accountProfile, atProtoStarter }}>
      {children}
    </atProtoContext.Provider>
  );
}

export function useATProto() {
  return useContext(atProtoContext);
}
