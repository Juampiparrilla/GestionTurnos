import { Toast } from "@base-ui/react/toast";

// Manager global: se puede llamar toastManager.add(...) desde cualquier
// componente (incluso uno que ya se desmontó, como un Sheet que se cierra
// apenas se crea algo) porque no depende del árbol de React -- el <Toaster/>
// montado una sola vez en el layout raíz se suscribe a este mismo manager.
export const toastManager = Toast.createToastManager();

export function showSuccessToast(title: string) {
  toastManager.add({ title, type: "success", timeout: 3000 });
}
