"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Botón "i" del celular: muestra en un diálogo el texto que explica esa
// pantalla, que en la compu va escrito arriba. Ahorra un párrafo de alto en
// cada pantalla. Solo se ve en el celular (en la compu el texto ya está a la vista).
export function InfoPantalla({ titulo, texto, className }: { titulo: string; texto: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Sobre esta pantalla: ${titulo}`}
            className={cn("size-11 shrink-0 px-0 md:hidden", className)}
          >
            <Info className="size-4" aria-hidden="true" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{texto}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
