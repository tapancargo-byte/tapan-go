import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-container">
      {/* Left side - Form */}
      <div className="auth-form">
        <div className="auth-box">
          <div className="flex items-center gap-2 mb-8">
            <Image
              src="/icons/logo.svg" 
              alt="Tapango Logo"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="font-bold text-xl tracking-tight">Tapango</span>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="auth-illustration">
        <div className="relative w-full h-full">
           {/* Placeholder for an illustration or abstract pattern */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
           {/* Example: Could add the Lottie animation here instead of in the page */}
           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
             Secure Logistics
           </div>
        </div>
      </div>
    </div>
  );
}
