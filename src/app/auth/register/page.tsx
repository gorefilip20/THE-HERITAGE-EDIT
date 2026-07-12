import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create Account — The Heritage Edit",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ivory">
          <Loader2 className="w-6 h-6 animate-spin text-heritage-green" />
        </div>
      }
    >
      <AuthForm mode="register" />
    </Suspense>
  );
}
