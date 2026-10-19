function parseLocations(value) {
  return String(value || "").split("|").map(location => location.trim()).filter(Boolean);
}

export const deliveryVillages = parseLocations(import.meta.env.VITE_DELIVERY_VILLAGES);
export const deliveryPostOffices = parseLocations(import.meta.env.VITE_DELIVERY_POST_OFFICES);

function parseMapCenter(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const parts = normalized.split(",").map(coordinate => coordinate.trim());
  if (parts.some(coordinate => !coordinate)) return null;
  const coordinates = parts.map(Number);
  if (coordinates.length !== 2) return null;
  const [latitude, longitude] = coordinates;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) return null;
  return [latitude, longitude];
}

export const deliveryMapCenter = parseMapCenter(import.meta.env.VITE_DELIVERY_MAP_CENTER);
