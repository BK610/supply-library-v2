import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Supply Library",
  description: "A little friendly neighborhood library... of supplies!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-svh flex flex-col`}>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
