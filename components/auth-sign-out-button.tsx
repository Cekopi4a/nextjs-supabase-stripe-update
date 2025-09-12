"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOutAction } from "@/app/actions";
import { useState } from "react";

export default function AuthPageSignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await signOutAction();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  }

  return (
    <Button onClick={signOut} disabled={isSigningOut}>
      <div className="flex items-center">
        <Spinner
          variant="primary"
          isLoading={isSigningOut}
          className="mr-[8px]"
        />
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </div>
    </Button>
  );
}
