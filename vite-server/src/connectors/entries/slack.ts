import { slack } from "@squadbase/connectors/sdk";
import { slackConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(slackConnector, slack);
