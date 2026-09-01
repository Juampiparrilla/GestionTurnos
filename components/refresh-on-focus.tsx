"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Vuelve a pedir los datos de la página actual al servidor cuando el
// usuario vuelve a esta pestaña/ventana -- ej. cargó algo desde el
// celular y volvió a la compu, antes había que apretar F5 a mano para
// verlo reflejado.
export function RefreshOnFocus() {
  const router = useRouter();
  const ultimoRefresh = useRef(0);

  useEffect(() => {
    function refrescar() {
      // evita disparar varios refresh seguidos si el usuario cambia de
      // pestaña rápido varias veces
      const ahora = Date.now();
      if (ahora - ultimoRefresh.current < 3000) return;
      ultimoRefresh.current = ahora;
      router.refresh();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") refrescar();
    }

    window.addEventListener("focus", refrescar);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", refrescar);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
