import { gemini } from "@squadbase/connectors/sdk";
import { geminiConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(geminiConnector, gemini);
