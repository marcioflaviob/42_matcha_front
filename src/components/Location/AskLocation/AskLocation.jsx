import { displayAlert }  from "../../Notification/Notification";
import { useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../../../context/UserContext";

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
  } catch (error) {
    displayAlert('error', error.response?.data?.message || 'Error fetching address');
    return 'Unknown';
  }
};

export const AskLocation = (showNotification) => {

  const { setUser } = useContext(UserContext);

  const setCityAndCountry = async (latitude, longitude, token, userId) => {
    try {
      const result = await axios.post(`${import.meta.env.VITE_API_URL}/location/city`,
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
      setUser((prevUser) => ({
        ...prevUser,
        location: result.data
      }));
    } catch (error) {
      displayAlert('error', error.response?.data?.message || 'Error setting city and country');
      return { city: 'Unknown', country: 'Unknown' };
    }
  };

  const setLocationFromIP = async (userId, token) => {
    try {
      const result = await axios.post(`${import.meta.env.VITE_API_URL}/location/ip/${userId}`, {}, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      setUser((prevUser) => ({
        ...prevUser,
        location: result.data.location
      }));
      if (showNotification) displayAlert('success', 'Location updated successfully');
    } catch (error) {
      displayAlert('error', error.response?.data?.message || 'Unable to get your location. Please try again later or check your network connection.');
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
          if (showNotification) displayAlert('success', 'Location updated successfully');
        } catch (error) {
          await setLocationFromIP(userId, token);
        }
    } else {
      await setLocationFromIP(userId, token);
    }
  };

  return { setLocation };
};

export default AskLocation;