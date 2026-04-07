import { shopifyOauth } from "@squadbase/connectors/sdk";
import { shopifyOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(shopifyOauthConnector, shopifyOauth);
