import { DEFAULT_CURRENCY, currencyForRegion } from "./currency";
import type { ReceiptSettings } from "./settings-api";

// No persistent cache: the identity includes account credentials and shop keys.
export function createCurrencyStore() {
  let currency = DEFAULT_CURRENCY;
  let identity = "";
  let generation = 0;
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    snapshot: () => currency,
    identity: () => identity,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    publish(settings: ReceiptSettings, expectedIdentity: string) {
      if (identity !== expectedIdentity) return;
      ++generation;
      currency = currencyForRegion(settings.region);
      emit();
    },
    refresh(nextIdentity: string, authenticated: boolean, fetchSettings: () => Promise<ReceiptSettings>, force = false) {
      const changed = identity !== nextIdentity;
      if (changed) {
        identity = nextIdentity;
        ++generation;
        pending = null;
        currency = DEFAULT_CURRENCY;
        emit();
      }
      if (!authenticated || (!changed && !force) || pending) return pending ?? Promise.resolve();
      const requestGeneration = generation;
      const request = fetchSettings().then((settings) => {
        if (generation === requestGeneration && identity === nextIdentity) {
          currency = currencyForRegion(settings.region);
          emit();
        }
      }).catch(() => {
        // Keep this shop's last successfully loaded settings on fetch failures.
      }).finally(() => { if (pending === request) pending = null; });
      pending = request;
      return request;
    },
  };
}
