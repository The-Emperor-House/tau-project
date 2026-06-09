// hooks/useLogout.js
import { useState } from "react";
import { signOut } from "next-auth/react";

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = async (refreshToken) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Logout failed");
      }

      // ล้าง session ฝั่ง NextAuth
      await signOut({ callbackUrl: "/auth/login" });
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || "Unexpected error");
      await signOut({ callbackUrl: "/auth/login" }); // ป้องกันหลุด
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
}
