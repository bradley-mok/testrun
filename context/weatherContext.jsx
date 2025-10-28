import React, { createContext, useContext, useState, useEffect } from "react";
import { getData, storeData } from "../utilities/asyncStorage";

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [astro, setAstro] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load weather and astro data from AsyncStorage on app start
  useEffect(() => {
    (async () => {
      const savedWeather = await getData("weatherData");
      const savedAstro = await getData("astroData");

      if (savedWeather) setWeather(savedWeather);
      if (savedAstro) setAstro(savedAstro);

      setLoading(false);
    })();
  }, []);

  // Every time data changes, update AsyncStorage
  useEffect(() => {
    if (weather) storeData("weatherData", weather);
  }, [weather]);

  useEffect(() => {
    if (astro) storeData("astroData", astro);
  }, [astro]);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        setWeather,
        astro,
        setAstro,
        loading,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
