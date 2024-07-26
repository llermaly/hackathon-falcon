import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import "react-multi-carousel/lib/styles.css";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Destiny Crafter",
  description: "Craft your destiny",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext, AppProvider } from "@/context/app-context";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} data-theme="light">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
