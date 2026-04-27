export function FormatAmount(amount: number, noSign?: boolean): string {
  if (noSign) {
    return amount.toLocaleString("en-NG", {
      style: "decimal",
      minimumFractionDigits: 2,
    });
  }
  return amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
}