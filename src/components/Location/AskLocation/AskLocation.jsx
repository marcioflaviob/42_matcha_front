import React, { useContext } from 'react';
import { displayAlert }  from "../../Notification/Notification";
import { AuthContext } from '../../../context/AuthContext';

import axios from 'axios';

export const getAddress = async (latitude, longitude, token) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/location/address?latitude=${latitude}&longitude=${longitude}`,
    {
      headers: {
          Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    const data = await response.data;
    if (data.results) {
        const components = data.results[0].components;
        const addressParts = [
          components.road,
          components.house_number,
          components.neighbourhood,
          components.suburb,
          components.city || components.town || components.village,
          components.state,
          components.postcode,
          components.country
        ].filter(Boolean);
        return addressParts.length > 0 ? addressParts.join(', ') : 'Unknown';
    } else {
        throw new Error('Unable to fetch address.');
    }
  } catch (err) {
    console.error('Error fetching address:', err);
    return 'Unknown';
  }
};

export const AskLocation = () => {
  const { token } = useContext(AuthContext);

  const setCityAndCountry = async (latitude, longitude, token, userId) => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/location/city`,
      {
        userId: userId,
        latitude: latitude,
        longitude: longitude,
      },
      {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
  } catch (err) {
    console.error('Error fetching city and country:', err);
    return { city: 'Unknown', country: 'Unknown' };
  }
};

  const setLocationFromIP = async (userId, token) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/location/ip/${userId}`, {}, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      displayAlert('success', 'Location updated successfully');
    } catch (err) {
      console.error('Error getting location from IP:', err);
      displayAlert('error', 'Unable to get your location. Please try again later or check your network connection.');
    }
  };

  const setLocation = async (userId, token) => {
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
          await setCityAndCountry(latitude, longitude, token, userId);
          displayAlert('success', 'Location updated successfully');
        } catch (error) {
          await setLocationFromIP(userId);
        }
    } else {
      await setLocationFromIP(userId, token);
    }
  };

  return { setLocation };
};

export default AskLocation;