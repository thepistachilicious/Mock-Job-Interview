import Navbar from "@/app/component/layout/Navbar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "./context/AuthContext";
 
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
 