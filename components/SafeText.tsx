// components/SafeText.tsx
import * as React from "react";

export function toRenderable(x: unknown): React.ReactNode {
  if (typeof x === "bigint") return x.toString();
  if (Array.isArray(x)) return x.map(toRenderable);
  if (x && typeof x === "object") return x as React.ReactNode; // objects are fine if they're elements/iterables
  return x as React.ReactNode;
}

export function SafeText({ value }: { value: unknown }) {
  return <>{toRenderable(value)}</>;
}
