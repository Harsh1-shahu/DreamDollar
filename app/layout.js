import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "./Context/ProjectContext";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dream Dollar Life",
  description: "dreamdollar.life",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-xl mx-auto`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
