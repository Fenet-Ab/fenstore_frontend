"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar/page";
import Footer from "./Footer/page";
import FloatingSupportChat from "./Support/FloatingSupportChat";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/Admin");

    return (
        <>
            {!isAdminPage && <Navbar />}
            {children}
            {!isAdminPage && <Footer />}
            {!isAdminPage && <FloatingSupportChat />}
        </>
    );
}
