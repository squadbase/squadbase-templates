import { dbt } from "@squadbase/connectors/sdk";
import { dbtConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(dbtConnector, dbt);
