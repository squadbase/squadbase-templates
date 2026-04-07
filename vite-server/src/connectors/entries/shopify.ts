import { shopify } from "@squadbase/connectors/sdk";
import { shopifyConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(shopifyConnector, shopify);
