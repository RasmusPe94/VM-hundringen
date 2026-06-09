const sekFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number | string | null | undefined) {
  return sekFormatter.format(toNumber(value));
}

export function formatDecimal(value: number | string | null | undefined) {
  return numberFormatter.format(toNumber(value));
}

export function formatRoi(value: number | string | null | undefined) {
  return `${formatDecimal(value)}x`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Ej satt";
  }

  return dateFormatter.format(new Date(value));
}

export function formatStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "Pågående",
    won: "Vunnen",
    lost: "Förlorad",
    void: "Void"
  };

  return labels[status] ?? status;
}

export function money(value: number) {
  return Math.round(value * 100) / 100;
}
