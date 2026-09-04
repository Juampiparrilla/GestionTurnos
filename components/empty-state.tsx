import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

// Mismo cajón punteado que ya se usaba en todos lados, pero con un ícono
// arriba del texto -- un mensaje gris solo se sentía más vacío/abandonado
// de lo que hace falta para algo tan común como "todavía no cargaste nada".
export function EmptyState({
  icon: Icon = Inbox,
  children,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-2 size-8 text-muted-foreground/50" aria-hidden="true" />
      {children}
    </div>
  );
}
