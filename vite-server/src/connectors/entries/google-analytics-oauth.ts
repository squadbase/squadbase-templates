import { googleAnalyticsOauth } from "@squadbase/connectors/sdk";
import { googleAnalyticsOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(googleAnalyticsOauthConnector, googleAnalyticsOauth);
