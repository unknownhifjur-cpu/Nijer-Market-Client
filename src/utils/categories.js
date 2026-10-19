export function normalizeCategory(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function categoryKey(value) {
  return normalizeCategory(value).toLocaleLowerCase("en");
}

export function getProductCategories(products = []) {
  const categories = new Map();
  products.forEach(product => {
    const label = normalizeCategory(product.category);
    const key = categoryKey(label);
    if (label && !categories.has(key)) categories.set(key, label);
  });
  return [...categories.values()].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
}
