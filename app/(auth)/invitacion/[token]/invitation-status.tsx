import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InvitationStatusScreen({
  title,
  message,
  showLogin,
}: {
  title: string;
  message: string;
  showLogin?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {showLogin && (
          <Link href="/login" className={buttonVariants({ className: "mx-4 mb-4" })}>
            Ir al login
          </Link>
        )}
      </Card>
    </main>
  );
}
