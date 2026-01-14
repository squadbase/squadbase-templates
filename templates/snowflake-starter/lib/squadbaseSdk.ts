import { createNextjsServerClient } from "@squadbase/nextjs";

export const getSquadbaseSdkClient = () => {
  return createNextjsServerClient();
};
