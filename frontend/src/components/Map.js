import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
const libs = ["places"];

export default function Map({ apiKey, location, setLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libs,
  });
  const defaultLocation = { lat: -33.4513, lng: -70.6653 };
  const [center, setCenter] = useState(location || defaultLocation);
  const [autoComplete, setAutoComplete] = useState();
  const searchedLocation = useRef();

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
    }
  }, [center, location, setLocation]);

  const onSerchBoxLoad = (ref) => {
    setAutoComplete(ref);
    if (location) {
      searchedLocation.current.value = location.searchedLocation || "";
    }
  };

  const onPlacesChanged = () => {
    const place =
      autoComplete && autoComplete.getPlace() ? autoComplete.getPlace() : null;
    if (place && Object.keys(place).length > 1) {
      const geometryLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(geometryLocation);
      setLocation({
        ...geometryLocation,
        searchedLocation: searchedLocation.current.value,
        place: place,
      });
    }
  };

  const onDragEnd = (markerEvent) => {
    setLocation({
      ...location,
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
          <Autocomplete
            onLoad={onSerchBoxLoad}
            onPlaceChanged={onPlacesChanged}
          >
            <div className="map-input-box-wrapper">
              <input
                type="text"
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
                placeholder="Search your address"
                ref={searchedLocation}
                className={`${!setLocation && "pe-none"}`}
              />
            </div>
          </Autocomplete>
          <MarkerF
            draggable={!!setLocation}
            onDragEnd={(e) => onDragEnd(e)}
            position={location}
          />
        </GoogleMap>
      </div>
    )
  );
}
