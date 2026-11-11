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
        <p className="text-center text-sm opacity-70">
          New to learnspace?{" "}
          <Link href={CONFIG.ROUTES.REGISTER} className="font-semibold underline underline-offset-4">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div role="alert" className="carbon-inset rounded-xl p-3 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="carbon-inset h-12 rounded-xl px-4 focus-visible:ring-ivory"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="carbon-inset h-12 rounded-xl px-4 focus-visible:ring-ivory"
          />
        </div>
        <Button
          type="submit"
          className="carbon-inset h-12 w-full rounded-xl text-sm font-medium hover:bg-carbon"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}