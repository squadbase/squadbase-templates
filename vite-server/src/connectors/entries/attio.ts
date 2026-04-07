import { attio } from "@squadbase/connectors/sdk";
import { attioConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(attioConnector, attio);
