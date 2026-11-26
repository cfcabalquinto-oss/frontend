"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: false });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isChecking) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!data?.accessToken) {
        throw new Error("Sign in failed because the server did not return an access token.");
      }

      setTokens(data.accessToken, data.refreshToken);
      router.push(CONFIG.ROUTES.DASHBOARD);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to pick up right where you left off."
      footer={
        <p className="text-center text-sm text-[#9b9ba2]">
          New to Adali?{" "}
          <Link href={CONFIG.ROUTES.REGISTER} className="font-semibold text-[#ff9a55] transition hover:text-white">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
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
            placeholder="Your username"
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-xl border-white/10 bg-[#09090b] px-4 text-sm text-white placeholder:text-[#6f6f77] focus-visible:border-[#d9470a] focus-visible:ring-2 focus-visible:ring-[#d9470a]/30"
          />
        </div>
        <Button
          type="submit"
          className="auth-signin-button h-12 w-full rounded-xl text-sm font-bold transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
