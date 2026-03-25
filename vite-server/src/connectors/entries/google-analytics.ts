import { googleAnalytics } from "@squadbase/connectors/sdk";
import { googleAnalyticsConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(googleAnalyticsConnector, googleAnalytics);
