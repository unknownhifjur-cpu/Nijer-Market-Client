import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Check, Crosshair, LoaderCircle, MapPin, Trash2 } from "lucide-react";

function MapViewport({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 14));
  }, [center, map]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    }
  });
  return null;
}

function formatCoordinate(value) {
  return value.toFixed(6);
}

export default function DeliveryLocationPicker({
  center,
  pendingLocation,
  selectedLocation,
  loading,
  disabled,
  status,
  error,
  onUseCurrentLocation,
  onSelectLocation,
  onConfirmLocation,
  onClearLocation
}) {
  const [tilesFailed, setTilesFailed] = useState(false);

  return (
    <section className="co-location-section" aria-labelledby="delivery-location-heading">
      <div className="co-location-heading">
        <div>
          <h3 id="delivery-location-heading">Delivery point on map</h3>
          <p>Choose a delivery point. Your address stays editable.</p>
        </div>
        <MapPin size={19} aria-hidden="true" />
      </div>

      <button
        className="co-location-current"
        type="button"
        onClick={onUseCurrentLocation}
        disabled={disabled || loading}
        aria-busy={loading}
      >
        {loading
          ? <LoaderCircle className="co-location-spinner" size={17} aria-hidden="true" />
          : <Crosshair size={17} aria-hidden="true" />}
        {loading ? "Getting your location…" : "Use My Current Location"}
      </button>

      {status && <p className="co-location-status" role="status">{status}</p>}
      {error && <p className="co-location-error" role="alert">{error}</p>}

      {center ? (
        <>
          <div className={`co-location-map${disabled ? " is-disabled" : ""}`}>
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="co-leaflet-map">
              <MapViewport center={center} />
              <MapClickHandler onSelect={onSelectLocation} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  tileerror: () => setTilesFailed(true),
                  load: () => setTilesFailed(false)
                }}
              />
              {pendingLocation && (
                <CircleMarker
                  center={[pendingLocation.latitude, pendingLocation.longitude]}
                  radius={9}
                  pathOptions={{ color: "#087a4b", fillColor: "#087a4b", fillOpacity: 0.8, weight: 3 }}
                />
              )}
              {selectedLocation && (!pendingLocation ||
                pendingLocation.latitude !== selectedLocation.latitude ||
                pendingLocation.longitude !== selectedLocation.longitude) && (
                <CircleMarker
                  center={[selectedLocation.latitude, selectedLocation.longitude]}
                  radius={8}
                  pathOptions={{ color: "#f06a1b", fillColor: "#f06a1b", fillOpacity: 0.7, weight: 3 }}
                />
              )}
            </MapContainer>
          </div>
          <p className="co-map-hint">Select a point on the map, then confirm it.</p>
          {tilesFailed && (
            <p className="co-location-error" role="status">
              Map unavailable. Retry or continue without a map point.
            </p>
          )}
        </>
      ) : (
        <p className="co-map-unconfigured">
          Use your current location, or set a verified store map center.
        </p>
      )}

      {(pendingLocation || selectedLocation) && (
        <div className="co-location-selection" aria-live="polite">
          {pendingLocation && (
            <p>
              {selectedLocation ? "Map point to confirm: " : "Selected point: "}
              <code>{formatCoordinate(pendingLocation.latitude)}, {formatCoordinate(pendingLocation.longitude)}</code>
            </p>
          )}
          {!pendingLocation && selectedLocation && (
            <p>Confirmed delivery point: <code>{formatCoordinate(selectedLocation.latitude)}, {formatCoordinate(selectedLocation.longitude)}</code></p>
          )}
          <div className="co-location-actions">
            {pendingLocation && (
              <button
                className="co-location-confirm"
                type="button"
                onClick={onConfirmLocation}
                disabled={disabled}
              >
                <Check size={16} aria-hidden="true" />
                Confirm selected location
              </button>
            )}
            {selectedLocation && (
              <button
                className="co-location-clear"
                type="button"
                onClick={onClearLocation}
                disabled={disabled}
              >
                <Trash2 size={15} aria-hidden="true" />
                Clear location
              </button>
            )}
          </div>
        </div>
      )}
      <small className="co-location-disclaimer">
        OpenStreetMap usage limits apply. A map point does not guarantee delivery.
      </small>
    </section>
  );
}
