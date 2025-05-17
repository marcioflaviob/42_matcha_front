import React, { useState, useRef } from 'react';

// Utility function moved outside
export const getCityAndCountry = async (latitude, longitude) => {
  try {
    const response = axios.get(`${import.meta.env.VITE_API_URL}/location/city?latitude=${latitude}&longitude=${longitude}`,
    {
      headers: {
          Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    const data = await response.json();
    if (data.results) {
      const components = data.results[0].components;
      return {
        city: components.city || components.town || components.village || 'Unknown',
        country: components.country || 'Unknown',
      };
    } else {
      throw new Error('Unable to fetch city and country.');
    }
  } catch (err) {
    console.error('Error fetching city and country:', err);
    return { city: 'Unknown', country: 'Unknown' };
  }
};

// AskLocation component
export const AskLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const addressRef = useRef({ city: '', country: '' });

  const getLocation = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          const newAddress = await getCityAndCountry(latitude, longitude);
          addressRef.current = newAddress;
          setError(null);
          setLoading(false);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            getLocationFromIP();
          } else {
            setError(err.message);
          }
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const getLocationFromIP = async () => {
    try {
      const response = axios.get(`${import.meta.env.VITE_API_URL}/location/ip`,
      {
          headers: {
              Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
      })
      const data = await response.json();
      setLocation({ latitude: data.latitude, longitude: data.longitude });
      const newAddress = { city: data.city, country: data.country };
      addressRef.current = newAddress;
      setError(null);
    } catch (err) {
      console.error('Error getting location', err);
      setError('Unable to fetch location from IP.');
    }
  };

  return { location, error, loading, getLocation, getLocationFromIP, addressRef };
};

export default AskLocation;