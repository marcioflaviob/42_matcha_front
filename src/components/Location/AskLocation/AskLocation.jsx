import React, {useState, useRef } from 'react';

const AskLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const addressRef = useRef({ city: '', country: '' }); // Use useRef for synchronous access

  const getLocation = async () => {
    setLoading(true); // Start loading
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          const newAddress = await getCityAndCountry(latitude, longitude); // Get city and country
          addressRef.current = newAddress; // Update the ref synchronously
          setError(null);
          setLoading(false); // Stop loading
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            getLocationFromIP(); // Fallback to IP-based location
          } else {
            setError(err.message);
          }
          setLoading(false); // Stop loading
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false); // Stop loading
    }
  };

  const getCityAndCountry = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_GEOCODE_API_KEY}`
      );
      const data = await response.json();
      if (data.results) {
        const components = data.results[0].components;
        const newAddress = {
          city: components.city || components.town || components.village || 'Unknown',
          country: components.country || 'Unknown',
        };
        return newAddress; // Return the address synchronously
      } else {
        setError('Unable to fetch city and country.');
        return { city: 'Unknown', country: 'Unknown' }; // Return a fallback address
      }
    } catch (err) {
      setError('Error fetching city and country.');
      return { city: 'Unknown', country: 'Unknown' }; // Return a fallback address
    }
  };

  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/'); // Example API
      const data = await response.json();
      setLocation({ latitude: data.latitude, longitude: data.longitude });
      const newAddress = await getCityAndCountry(data.latitude, data.longitude); // Get city and country from IP
      addressRef.current = newAddress; // Update the ref synchronously
      setError(null); // Clear any previous errors
    } catch (err) {
      setError('Unable to fetch location from IP.');
    }
  };

  return { location, error, loading, getLocation, getLocationFromIP, addressRef };
};

export default AskLocation;