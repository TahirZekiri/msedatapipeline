// src/app/layout.tsx
import "./globals.css";
import Navbar from "@/components/ui/navbar";

export const metadata = {
    title: "MStock",
    description: "Stock analysis and prediction platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <div className="px-4 sm:px-6 lg:px-8"> {/* Responsive padding container */}
            <Navbar />
            <main className="py-8">{children}</main>
        </div>
        </body>
        </html>
    );
}