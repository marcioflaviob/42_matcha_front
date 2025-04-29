import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ user }) => {
    const pinpoints = [
        { id: 1, lat: 37.7749, lng: -122.4194, title: "San Francisco", description: "Golden Gate Bridge" },
        { id: 2, lat: 37.8049, lng: -122.3994, title: "Oakland", description: "Lake Merritt" }
      ];
    
      // Custom Snapchat-like marker
      const snapMarker = new L.Icon({
        iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/></svg>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      });
    
      return (
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          style={{ height: '100vh', width: '100%' }}
        >
          {/* Use a Snapchat-like tile layer - you might need to find or create one */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {pinpoints.map(pin => (
            <Marker 
              key={pin.id} 
              position={[pin.lat, pin.lng]}
              icon={snapMarker}
            >
              <Popup>
                <h3>{pin.title}</h3>
                <p>{pin.description}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      );
    
}

export default Map;