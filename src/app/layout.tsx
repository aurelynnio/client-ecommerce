import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReduxProvider } from "./Provider";
import { SocketProvider } from "@/context/SocketContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const inter = localFont({
  src: "../../public/fonts/InterVariable.woff2",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ecommerce",
  description: "Ecommerce",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      translate="no"
      className="notranslate"
      suppressHydrationWarning
    >
      <body
        translate="no"
        className={`${inter.variable} notranslate antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider>
          <SocketProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
