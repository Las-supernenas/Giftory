//Formats a price as Spanish euros, 39 -> 39,00€
//Intl.NumberFormat is built into the browser: no library needed

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(price: number): string {
  return priceFormatter.format(price);
}
