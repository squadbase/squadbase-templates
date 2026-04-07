import { airtableOauth } from "@squadbase/connectors/sdk";
import { airtableOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(airtableOauthConnector, airtableOauth);
