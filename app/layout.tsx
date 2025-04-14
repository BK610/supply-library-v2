import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">{children}</main>
        <footer
          className="w-full py-4 text-center text-sm text-gray-600 dark:text-gray-400
        bg-gray-100 dark:bg-gray-950 border-t border-gray-300 dark:border-gray-700"
        >
          Built by{" "}
          <a
            href="https://www.baileykane.co?ref=supplylibrary"
            target="_blank"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Bailey Kane
          </a>
          , for friends
        </footer>
      </body>
    </html>
  );
}
