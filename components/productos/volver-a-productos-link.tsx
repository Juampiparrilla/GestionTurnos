import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";

export function VolverAProductosLink() {
  return (
    <Link
      href="/productos"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Volver a Productos
      <LinkPendingSpinner />
    </Link>
  );
}
