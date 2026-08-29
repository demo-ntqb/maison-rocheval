import type { CartMoney } from "@/shared/types/cart.type";

function splitAmount(amount: string): { units: bigint; scale: number } {
  const normalized = amount.trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [whole = "0", fraction = ""] = unsigned.split(".");
  const digits = `${whole || "0"}${fraction}`.replace(/^0+(?=\d)/, "") || "0";
  return { units: BigInt(`${negative ? "-" : ""}${digits}`), scale: fraction.length };
}

function formatUnits(units: bigint, scale: number): string {
  const negative = units < 0n;
  const digits = (negative ? -units : units).toString().padStart(scale + 1, "0");
  const value = scale === 0
    ? digits
    : `${digits.slice(0, -scale) || "0"}.${digits.slice(-scale)}`;
  return negative ? `-${value}` : value;
}

export function multiplyMoney(money: CartMoney, quantity: number): CartMoney {
  const { units, scale } = splitAmount(money.amount);
  return {
    amount: formatUnits(units * BigInt(quantity), scale),
    currencyCode: money.currencyCode,
  };
}

export function sumMoney(values: CartMoney[], fallbackCurrency: string): CartMoney {
  if (values.length === 0) return { amount: "0.00", currencyCode: fallbackCurrency };
  const currencyCode = values[0]?.currencyCode ?? fallbackCurrency;
  const parsed = values.map((value) => splitAmount(value.amount));
  const scale = Math.max(...parsed.map((value) => value.scale));
  const total = parsed.reduce(
    (sum, value) => sum + value.units * 10n ** BigInt(scale - value.scale),
    0n,
  );
  return { amount: formatUnits(total, scale), currencyCode };
}
