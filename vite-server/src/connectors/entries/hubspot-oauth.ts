import { hubspotOauth } from "@squadbase/connectors/sdk";
import { hubspotOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(hubspotOauthConnector, hubspotOauth);
