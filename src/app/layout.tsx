import { Inter } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from '@next/third-parties/google'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteDetails } from "@/data/siteDetails";


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
                <Header />
                {children}
                <Footer />
                {siteDetails.googleAnalyticsId && (
                    <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />
                )}
            </body>
        </html>
    );
}
