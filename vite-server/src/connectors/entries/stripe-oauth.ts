import { stripeOauth } from "@squadbase/connectors/sdk";
import { stripeOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(stripeOauthConnector, stripeOauth);
