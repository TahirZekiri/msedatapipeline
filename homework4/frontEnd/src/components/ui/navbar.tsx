//src/components/ui/navbar.tsx
"use client"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FiMenu } from "react-icons/fi";

export default function Navbar() {
    const pathname = usePathname();
    const activePage = pathname === "/" ? "Home" : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="border-b border-gray-300">
            <div className="flex items-center justify-between py-4">
                {/* Logo */}
                <div className="font-bold text-4xl text-black">
                    <Link href="/">MStock</Link>
                </div>

                {/* Desktop Navigation Buttons */}
                <div className="hidden md:flex space-x-2 border border-gray-900 rounded-lg p-1">
                    <Link href="/">
                        <Button
                            variant={activePage === "Home" ? "default" : "outline"}
                            className={cn(
                                "px-7",
                                activePage === "Home" ? "bg-black text-white" : "border-gray-300"
                            )}
                        >
                            Home
                        </Button>
                    </Link>
                    <Link href="/news">
                        <Button
                            variant={activePage === "News" ? "default" : "outline"}
                            className={cn(
                                "px-7",
                                activePage === "News" ? "bg-black text-white" : "border-gray-300"
                            )}
                        >
                            News
                        </Button>
                    </Link>
                    <Link href="/issuers">
                        <Button
                            variant={activePage === "Issuers" ? "default" : "outline"}
                            className={cn(
                                "px-7",
                                activePage === "Issuers" ? "bg-black text-white" : "border-gray-300"
                            )}
                        >
                            Issuers
                        </Button>
                    </Link>
                    <Link href="/about">
                        <Button
                            variant={activePage === "About" ? "default" : "outline"}
                            className={cn(
                                "px-7",
                                activePage === "About" ? "bg-black text-white" : "border-gray-300"
                            )}
                        >
                            About
                        </Button>
                    </Link>
                </div>

                {/* Mobile Dropdown Menu */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className=" flex items-center space-x-2"
                            >
                                <FiMenu size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        {isMenuOpen && (
                            <DropdownMenuContent className="-translate-x-4">
                                <DropdownMenuItem asChild>
                                    <Link href="/" className={cn(activePage === "Home" ? "bg-gray-200" : "")}>
                                        Home
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/news" className={cn(activePage === "News" ? "bg-gray-200" : "")}>
                                        News
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/issuers" className={cn(activePage === "Issuers" ? "bg-gray-200" : "")}>
                                        Issuers
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/about" className={cn(activePage === "About" ? "bg-gray-200" : "")}>
                                        About
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
