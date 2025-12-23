import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { redirect } from 'next/navigation';
import Image from "next/image";

export default function HomePage() {
  const isConfigured = !!process.env.GA_SERVICE_ACCOUNT_JSON_BASE64;

  if (isConfigured) {
    redirect('/cv-page-analysis');
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Google Analytics Dashboard</h1>
        </div>

        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">🚀 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold text-blue-900">
              Click on "Setup Google Analytics" displayed on the right side and enter the required information to configure your dashboard.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Dashboard Preview</CardTitle>
            <CardDescription>
              After completing the setup, you will be able to access a comprehensive analytics dashboard like this:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src="/ga-demo.png"
                alt="Google Analytics Dashboard Preview - showing engagement metrics, page analysis, and user behavior charts"
                width={1400}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              The dashboard includes various analytics views such as page engagement time analysis, returning user metrics, and engagement rate visualizations to help you understand your website's performance.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
