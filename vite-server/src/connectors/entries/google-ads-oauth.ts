import { googleAds } from "@squadbase/connectors/sdk";
import { googleAdsOauthConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(googleAdsOauthConnector, googleAds);
