function parseLocations(value) {
  return String(value || "").split("|").map(location => location.trim()).filter(Boolean);
}

const defaultDeliveryVillages = [
  "Chandranarayanpur",
  "Tinshata Bighi",
  "Notun Sikosti",
  "Raipur",
  "Mirjachak",
  "Sahabanchak"
];
const defaultDeliveryPostOffices = ["Bedrabad", "Baishnabnagar"];

const configuredDeliveryVillages = parseLocations(import.meta.env.VITE_DELIVERY_VILLAGES);
export const deliveryVillages = configuredDeliveryVillages.length
  ? configuredDeliveryVillages
  : defaultDeliveryVillages;
const configuredDeliveryPostOffices = parseLocations(import.meta.env.VITE_DELIVERY_POST_OFFICES);
export const deliveryPostOffices = configuredDeliveryPostOffices.length
  ? configuredDeliveryPostOffices
  : defaultDeliveryPostOffices;

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
