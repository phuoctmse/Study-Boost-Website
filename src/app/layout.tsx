import { Inter } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from '@next/third-parties/google'
import { siteDetails } from "@/data/siteDetails";
import MainLayout from "@/components/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <title>{siteDetails.metadata.title}</title>
                <meta name="description" content={siteDetails.metadata.description} />
                <link rel="icon" href="/images/favicon.ico" />
            </head>
            <body className={inter.className}>
                <MainLayout>
                    {children}
                </MainLayout>
                {siteDetails.googleAnalyticsId && (
                    <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />
                )}
            </body>
        </html>
    );
}
