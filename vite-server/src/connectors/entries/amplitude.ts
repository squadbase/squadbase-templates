import { amplitude } from "@squadbase/connectors/sdk";
import { amplitudeConnector } from "@squadbase/connectors";
import { createConnectorSdk } from "../create-connector-sdk.ts";

export const connection = createConnectorSdk(amplitudeConnector, amplitude);
