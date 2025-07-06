import type { Metadata } from "next";
import { Ubuntu} from "next/font/google";
import "./globals.css";

// Define Ubuntu font with proper variable name
const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  weight: ["300", "400", "500", "700"],
});

// const geistMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-geist-mono",
// });

export const metadata: Metadata = {
  title: "WordFlight",
  description: "Messaging app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}