import { kintone } from "@squadbase/connectors/sdk";
import { kintoneConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(kintoneConnector, kintone);
