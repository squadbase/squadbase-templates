import { googleSheets } from "@squadbase/connectors/sdk";
import { googleSheetsOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(googleSheetsOauthConnector, googleSheets);
