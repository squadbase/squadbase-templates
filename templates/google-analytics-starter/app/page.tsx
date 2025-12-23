import { redirect } from "next/navigation";

export default function Page() {
  const isConfigured = !!process.env.GA_SERVICE_ACCOUNT_JSON_BASE64;

  if (isConfigured) {
    redirect("/cv-page-analysis");
  } else {
    redirect("/home");
  }
}
