import { airtable } from "@squadbase/connectors/sdk";
import { airtableConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(airtableConnector, airtable);
