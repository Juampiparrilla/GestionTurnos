import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";

export function VolverAProductosLink() {
  return (
    <Link
      href="/productos"
      title="Volver a Productos"
      aria-label="Volver a Productos"
      className="inline-flex items-center text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
      <LinkPendingSpinner />
    </Link>
  );
}
