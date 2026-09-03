export function formatCurrency(amount: number | string | { toNumber: () => number }, currency = "NGN") {
  const value = typeof amount === "object" && amount !== null && "toNumber" in amount ? amount.toNumber() : (typeof amount === "string" ? Number(amount) : amount);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}
