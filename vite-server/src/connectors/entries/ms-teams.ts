import { msTeams } from "@squadbase/connectors/sdk";
import { msTeamsConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(msTeamsConnector, msTeams);
