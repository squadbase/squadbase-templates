import { openai } from "@squadbase/connectors/sdk";
import { openaiConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(openaiConnector, openai);
