import { useSyncExternalStore } from "react";

export function useMounted() {
  return useSyncExternalStore(
    () => () => {}, // no-op subscribe
    () => true,     // client snapshot
    () => false     // server snapshot
  );
}
