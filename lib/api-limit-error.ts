export function getLimitErrorMessage(value: unknown) {
  const text =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? JSON.stringify(value)
        : "";

  if (!text) return "";

  const lower = text.toLowerCase();
  const looksLikeLimit =
    lower.includes("limit") ||
    lower.includes("quota") ||
    lower.includes("maximum") ||
    lower.includes("max ") ||
    lower.includes("subscription") ||
    lower.includes("plan");

  if (!looksLikeLimit) return "";

  return text.length > 240
    ? "Your subscription plan limit has been reached. Please upgrade your plan or reduce usage."
    : text;
}
