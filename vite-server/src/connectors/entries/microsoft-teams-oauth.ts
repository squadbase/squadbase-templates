import { msTeamsOauth } from "@squadbase/connectors/sdk";
import { msTeamsOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(msTeamsOauthConnector, msTeamsOauth);
