import {
  GoogleMap,
  StandaloneSearchBox,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
const libs = ["places"];
const defaultLocation = { lat: -33.4513, lng: -70.6653 };

export default function Map({
  apiKey,
  location,
  setLocation,
  searchBox,
  setSearchBox,
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libs,
  });
  const [center, setCenter] = useState(defaultLocation);

  useEffect(() => {
    if (!location) {
      setLocation(center);
      if (!navigator.geolocation) {
        toast("Geolocation not supported by this browser");
      } else {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
          if (result.state !== "denied") {
            navigator.geolocation.getCurrentPosition((position) => {
              console.log(position);
              setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            });
          }
        });
      }
    } else {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [center, location, setLocation]);

  const onSerchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlaces()[0].geometry.location;
      setCenter({ lat: place.lat(), lng: place.lng() });
      setLocation({ lat: place.lat(), lng: place.lng() });
    }
  };

  const onDragEnd = (markerEvent) => {
    setLocation({
      lat: markerEvent.latLng.lat(),
      lng: markerEvent.latLng.lng(),
    });
  };

  return (
    isLoaded && (
      <div className="map-view">
        <GoogleMap
          id="google-map-script"
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={center}
          zoom={15}
        >
          <StandaloneSearchBox
            onLoad={onSerchBoxLoad}
            onPlacesChanged={onPlacesChanged}
          >
            <div className="map-input-box-wrapper">
              <input
                type="text"
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
                placeholder="Search your address"
              />
            </div>
          </StandaloneSearchBox>
          <MarkerF
            draggable={true}
            onDragEnd={(e) => onDragEnd(e)}
            position={location}
          />
        </GoogleMap>
      </div>
    )
  );
}
