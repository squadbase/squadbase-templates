import { wixStore } from "@squadbase/connectors/sdk";
import { wixStoreConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(wixStoreConnector, wixStore);
