import React, { useState, useContext, useRef } from 'react';
import { displayAlert }  from "../../Notification/Notification";
import { AuthContext } from '../../../context/AuthContext';

import axios from 'axios';

export const getCityAndCountry = async (latitude, longitude, token) => {
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

export const AskLocation = () => {
  const { token } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const addressRef = useRef({ city: '', country: '' });

  const getLocationFromIP = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/location/ip`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      setLocation({ latitude: response.data.latitude, longitude: response.data.longitude });
      const newAddress = { city: response.data.city, country: response.data.country };
      addressRef.current = newAddress;
      setLoading(false);
    } catch (err) {
      console.error('Error getting location from IP:', err);
      displayAlert('error', 'Unable to get your location. Please try again later or check your network connection.');
    }
  };

  const getLocation = async () => {
    setLoading(true);
    if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                  if (error.code === error.POSITION_UNAVAILABLE || 
                      error.code === error.TIMEOUT ||
                      error.code === error.UNKNOWN_ERROR) {
                      reject(new Error('Location unavailable'));
                  } else if (error.code === error.PERMISSION_DENIED) {
                      reject(new Error('Permission denied'));
                  } else {
                      reject(error);
                  }
                },
                {
                  enableHighAccuracy: false,
                  maximumAge: 30000,
                  timeout: 5000
                }
              );
          });

          const { latitude, longitude } = position.coords;
          const newAddress = await getCityAndCountry(latitude, longitude);
          addressRef.current = newAddress;
          displayAlert('success', 'Location updated successfully');
          setLoading(false);
        } catch (error) {
          console.error('Error getting location:', error);
          getLocationFromIP();
        }
    } else {
      getLocationFromIP();
    }
  };

  return { location, loading, getLocation, getLocationFromIP, addressRef };
};

export default AskLocation;