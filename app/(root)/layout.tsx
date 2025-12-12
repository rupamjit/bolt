import { onBoardUser } from "@/modules/auth/actions";
import React from "react";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await onBoardUser();
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Navbar */}
      {/* Background Gradient */}

      <div className="flex-1 w-full mt-20">{children}</div>
    </div>
  );
}

