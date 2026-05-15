"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background bg-blueprint-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded bg-safety mb-4">
            <span className="font-heading font-bold text-safety-foreground text-2xl">
              K
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Konstruksi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistem Manajemen Proyek
          </p>
        </div>

        {/* Login Card */}
        <div className="card-architectural rounded border border-border bg-card p-6 space-y-6">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Masuk
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Masuk untuk mengelola proyek konstruksi Anda
            </p>
          </div>

          {error && (
            <div className="p-3 rounded border border-destructive/30 bg-destructive/5 text-sm text-destructive flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label-architectural block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@konstruksi.id"
                  required
                  className="w-full h-10 pl-10 pr-4 bg-transparent border-b-2 border-border rounded-none text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-safety transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-architectural block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 pl-10 pr-10 bg-transparent border-b-2 border-border rounded-none text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-safety transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 bg-safety text-safety-foreground hover:bg-safety/90 rounded font-semibold text-xs uppercase tracking-wider h-11"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-safety-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="p-3 rounded bg-muted/30 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-muted-foreground">
                <span className="text-foreground/70">PM:</span>{" "}
                andi@konstruksi.id / password123
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground/70">Mandor:</span>{" "}
                joko@konstruksi.id / password123
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground/70">Keuangan:</span>{" "}
                admin@konstruksi.id / password123
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          © 2026 BEACON · Sistem Manajemen Proyek Konstruksi
        </p>
      </div>
    </div>
  );
}
