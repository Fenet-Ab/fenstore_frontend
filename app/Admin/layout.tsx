import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col antialiased">
            {/* Remove global layout's navbar/footer effect if possible? 
          Actually, since it's in a subdirectory, the root layout still applies.
          To truly remove it, one would need route groups, but I'll work with what I have.
          Or I can just make the dashboard look good regardless.
      */}
            {children}
        </div>
    );
}