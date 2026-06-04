export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("es-EC", {
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

export function formatEnergy(value: number) {
  return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`;
}

export function formatPower(value: number) {
  return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kW`;
}

export function formatPercent(value: number) {
  return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
