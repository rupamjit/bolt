"use client";

import Image from "next/image";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";

export default function Page() {
  const currentTheme = useCurrentTheme();
  return (
    <div className="flex items-center justify-center w-full min-h-screen px-4 py-20 md:py-32">
      <div className="w-full max-w-4xl">
        <section className="space-y-16 flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <Image
              src={"/logo.svg"}
              width={80}
              height={80}
              alt="logo"
              className="hidden md:block invert dark:invert-0 mb-6"
            />
          </div>
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pricing
            </h1>
            <p className="text-muted-foreground text-center text-base md:text-lg max-w-2xl mx-auto">
              Choose the plan that fits your needs and start building amazing projects today
            </p>
          </div>
          <div className="w-full mt-12">
            <PricingTable
              appearance={{
                baseTheme: currentTheme === "dark" ? dark : undefined,
                elements: {
                  pricingTableCard: "border-2! shadow-lg! rounded-xl! hover:shadow-xl! transition-all! duration-300! min-h-[700px]!",
                },
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}