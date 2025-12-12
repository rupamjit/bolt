import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <nav className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 ">
          <Image
            src="/logo3.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>

        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton>
              <Button
                className="cursor-pointer"
                size={"sm"}
                variant={"outline"}
              >
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button
                className="cursor-pointer"
                size={"sm"}
                variant={"default"}
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </nav>
  );
};

export default Navbar;
