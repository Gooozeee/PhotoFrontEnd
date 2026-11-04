import { useEffect } from "react";

/**
 * Warns before the tab is refreshed or closed while a long-running task
 * (such as a batch upload) is still in progress. Uploads are client-driven,
 * so an accidental refresh cancels everything still in the queue.
 */
export function useBeforeUnloadWarning(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active]);
}
