import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Context/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Dream Dollar Life",
  description: "dreamdollar.life",
  icons: { icon: "/logo.png" }, // ensure public/logo.png exists
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-xl mx-auto`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
