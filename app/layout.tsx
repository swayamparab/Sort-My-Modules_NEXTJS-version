import Navbar from "@/components/Navbar";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#1E2A3A",
                  color: "#fff",
                  borderRadius: "8px"
                }
              }}
            />
            <NextTopLoader
              color="#3b82f6"
              height={3}
              showSpinner={false}
              speed={250}
            />
            <Navbar />
            <main className="container">
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}