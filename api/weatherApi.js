import axios from "axios";
import { EXPO_PUBLIC_WEATHER_API_KEY as apiKey } from "@env"; 


const forecastEndpoint = (params) =>
  `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days || 7}`;

const locationsEndpoint = (params) =>
  `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const AstroEndpoint = (params) =>
`https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${params.cityName}&dt=${params.date || ''}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    }

    try {
      const response = await axios.get(endpoint);
      return response.data; 
    } catch (err) {
      console.error("API error:", err.message);
      return null;
    }
};


export const fetchWeatherForecast = async (params) => {
  let url = forecastEndpoint(params);
  return await apiCall(url);
};

export const fetchLocations = async (query) => {
  const url = locationsEndpoint(query);
  return await apiCall(url);
};

export const fetchAstronomyData = async (params) => {
  const url = AstroEndpoint(params);
  return await apiCall(url);
};
