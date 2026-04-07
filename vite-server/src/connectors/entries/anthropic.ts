import { anthropic } from "@squadbase/connectors/sdk";
import { anthropicConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(anthropicConnector, anthropic);
