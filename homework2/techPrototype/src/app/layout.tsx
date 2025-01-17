import "./globals.css";
import Navbar from "@/components/ui/navbar";

export const metadata = {
    title: "MStock",
    description: "Stock analysis and prediction platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="overflow-x-hidden">
        <head>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
            />
        </head>
        <body>
        <div className="max-w-5xl mx-auto px-4">
            <Navbar/>
            <main className="py-8">{children}</main>
        </div>
        </body>
        </html>
    );
}