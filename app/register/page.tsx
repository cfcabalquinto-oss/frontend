"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: false });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isChecking) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      router.push(CONFIG.ROUTES.LOGIN);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Build a learning routine that fits your life."
      footer={
        <p className="text-center text-sm text-[#9b9ba2]">
          Already have an account?{" "}
          <Link href={CONFIG.ROUTES.LOGIN} className="font-semibold text-[#ff9a55] transition hover:text-white">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleRegister} className="space-y-5">
        {error && (
          <div role="alert" className="rounded-xl border border-[#792d20] bg-[#24100c] p-3 text-sm text-[#ffad99]">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-[#dedee1]">Username</Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-12 rounded-xl border-white/10 bg-[#09090b] px-4 text-sm text-white placeholder:text-[#6f6f77] focus-visible:border-[#d9470a] focus-visible:ring-2 focus-visible:ring-[#d9470a]/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-[#dedee1]">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-xl border-white/10 bg-[#09090b] px-4 text-sm text-white placeholder:text-[#6f6f77] focus-visible:border-[#d9470a] focus-visible:ring-2 focus-visible:ring-[#d9470a]/30"
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-[#c93e08] text-sm font-bold text-white shadow-[0_8px_22px_rgba(201,62,8,0.2)] transition hover:bg-[#e24a10]"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
