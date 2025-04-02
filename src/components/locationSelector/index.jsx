import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { MapPin, X } from "lucide-react";

const LocationSelector = ({ onLocationSelect, initialLocation = "" }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [location, setLocation] = useState(initialLocation);
  const [coordinates, setCoordinates] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);

  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const mapCenter = { lat: 40.409264, lng: 49.867092 }; // Default center (Baku)
  const apiKey = "AIzaSyAclcN46yxtqM0GjlImot966mgWqVzBBQc"; // Your API key

  const mapContainerStyle = {
    width: "100%",
    height: "350px",
    borderRadius: "8px",
  };

  // Initialize autocomplete when map loads
  useEffect(() => {
    if (mapLoaded && inputRef.current && window.google) {
      const options = {
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false,
      };

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          setLocation(place.formatted_address);
          setCoordinates({ lat, lng });
          setMarkerPosition({ lat, lng });

          if (onLocationSelect) {
            onLocationSelect(place.formatted_address, { lat, lng });
          }
        }
      });
    }
  }, [mapLoaded, onLocationSelect]);

  // Handle map click to set marker and get location
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setMarkerPosition({ lat, lng });
    setCoordinates({ lat, lng });

    // Use reverse geocoding to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        setLocation(address);

        if (inputRef.current) {
          inputRef.current.value = address;
        }

        if (onLocationSelect) {
          onLocationSelect(address, { lat, lng });
        }
      }
    });
  };

  const toggleMap = () => {
    setIsMapOpen(!isMapOpen);
  };

  const clearLocation = () => {
    setLocation("");
    setCoordinates(null);
    setMarkerPosition(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (onLocationSelect) {
      onLocationSelect("", null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter or select event location"
          className="w-full pl-8 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
        />
        <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />

        {location && (
          <button
            type="button"
            onClick={clearLocation}
            className="absolute right-10 top-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={toggleMap}
          className="absolute right-2.5 top-1.5 w-6 h-6 flex items-center justify-center bg-[#f2fdfc] text-[#0AAC9E] rounded-full hover:bg-[#e0f7f5]"
        >
          <MapPin size={14} />
        </button>
      </div>

      {isMapOpen && (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden">
          <LoadScript
            googleMapsApiKey={apiKey}
            libraries={["places"]}
            onLoad={() => setMapLoaded(true)}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={markerPosition || mapCenter}
              zoom={13}
              onClick={handleMapClick}
              options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                zoomControl: true,
              }}
            >
              {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
          </LoadScript>
          <div className="absolute top-2 left-2 right-2 bg-white bg-opacity-90 py-2 px-3 rounded-md text-xs text-gray-700">
            Click anywhere on the map to select a location or use the search box
            above
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
