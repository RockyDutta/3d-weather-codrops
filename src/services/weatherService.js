import axios from 'axios';

//true false for prod or dev
const USE_API_ROUTE = true;
const API_BASE = '/api';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Demo data for when Vercel service is unavailable
const getDemoWeatherData = (requestedLocation) => ({
  location: {
    name: "Demo City",
    region: "Demo State",
    country: "Demo Country", 
    lat: 40.7128,
    lon: -74.0060,
    tz_id: "America/New_York",
    localtime_epoch: Math.floor(Date.now() / 1000),
    localtime: new Date().toISOString().slice(0, -5)
  },
  current: {
    last_updated_epoch: Math.floor(Date.now() / 1000),
    last_updated: new Date().toISOString().slice(0, -5),
    temp_c: 22,
    temp_f: 72,
    is_day: new Date().getHours() >= 6 && new Date().getHours() <= 18 ? 1 : 0,
    condition: {
      text: "Partly cloudy",
      icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      code: 1003
    },
    wind_mph: 8.5,
    wind_kph: 13.7,
    wind_degree: 230,
    wind_dir: "SW",
    pressure_mb: 1013.0,
    pressure_in: 29.91,
    precip_mm: 0.0,
    precip_in: 0.0,
    humidity: 65,
    cloud: 40,
    feelslike_c: 24,
    feelslike_f: 75,
    vis_km: 16.0,
    vis_miles: 10.0,
    uv: 5.0,
    gust_mph: 12.1,
    gust_kph: 19.4
  },
  forecast: {
    forecastday: [
      {
        date: new Date().toISOString().split('T')[0],
        date_epoch: Math.floor(Date.now() / 1000),
        day: {
          maxtemp_c: 26,
          maxtemp_f: 79,
          mintemp_c: 18,
          mintemp_f: 64,
          avgtemp_c: 22,
          avgtemp_f: 72,
          maxwind_mph: 12.1,
          maxwind_kph: 19.4,
          totalprecip_mm: 0.0,
          totalprecip_in: 0.0,
          totalsnow_cm: 0.0,
          avgvis_km: 16.0,
          avgvis_miles: 10.0,
          avghumidity: 65,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 10,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Partly cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
            code: 1003
          },
          uv: 5.0
        }
      },
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_epoch: Math.floor(Date.now() / 1000) + 86400,
        day: {
          maxtemp_c: 24,
          maxtemp_f: 75,
          mintemp_c: 16,
          mintemp_f: 61,
          avgtemp_c: 20,
          avgtemp_f: 68,
          maxwind_mph: 10.5,
          maxwind_kph: 16.9,
          totalprecip_mm: 2.1,
          totalprecip_in: 0.08,
          totalsnow_cm: 0.0,
          avgvis_km: 12.0,
          avgvis_miles: 7.0,
          avghumidity: 72,
          daily_will_it_rain: 1,
          daily_chance_of_rain: 80,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Light rain",
            icon: "//cdn.weatherapi.com/weather/64x64/day/296.png",
            code: 1183
          },
          uv: 3.0
        }
      },
      {
        date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_epoch: Math.floor(Date.now() / 1000) + 172800,
        day: {
          maxtemp_c: 28,
          maxtemp_f: 82,
          mintemp_c: 20,
          mintemp_f: 68,
          avgtemp_c: 24,
          avgtemp_f: 75,
          maxwind_mph: 15.2,
          maxwind_kph: 24.4,
          totalprecip_mm: 0.0,
          totalprecip_in: 0.0,
          totalsnow_cm: 0.0,
          avgvis_km: 16.0,
          avgvis_miles: 10.0,
          avghumidity: 58,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 5,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Sunny",
            icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
            code: 1000
          },
          uv: 7.0
        }
      }
    ]
  },
  rateLimited: true, // Flag to indicate this is demo data
  serviceUnavailable: true, // Flag to indicate service issues
  requestedLocation: requestedLocation, // Store what user actually searched for
  cached: false
});

export const weatherService = {
  getCurrentWeather: async (location) => {
    try {
      let response;
      
      if (USE_API_ROUTE) {
        // Use caching API route (for production/when enabled)
        response = await axios.get(`${API_BASE}/weather`, {
          params: { location },
          timeout: 10000
        });
        
        const data = response.data;
        
        // Log cache info for debugging
        if (data.serviceUnavailable) {
          console.log(`Vercel service unavailable - serving demo weather data for: ${location}`);
        } else if (data.rateLimited) {
          console.log(`Rate limited - serving demo weather data for: ${location}`);
        } else if (data.cached) {
          console.log(`Using cached weather data (${data.cacheAge}s old) for: ${location}`);
        } else {
          console.log(`Fresh weather data fetched for: ${location}`);
        }
        
        return data;
      } else {
        // Direct API call for local development using OpenWeatherMap
        console.log('Using direct API call for local development (OpenWeatherMap)');
        
        let queryParam = '';
        // Check if location is coordinates (e.g. "40.7128,-74.0060")
        if (location.includes(',') && !isNaN(parseFloat(location.split(',')[0]))) {
          const [lat, lon] = location.split(',').map(s => s.trim());
          queryParam = `lat=${lat}&lon=${lon}`;
        } else {
          queryParam = `q=${encodeURIComponent(location)}`;
        }
        
        const [currentResponse, forecastResponse] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${API_KEY}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?${queryParam}&appid=${API_KEY}&units=metric`)
        ]);
        
        const currentData = currentResponse.data;
        const forecastData = forecastResponse.data;

        // Map OpenWeatherMap data to the WeatherAPI format
        const dailyForecasts = {};
        forecastData.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
              date: date,
              date_epoch: new Date(date).getTime() / 1000,
              temps: [],
              winds: [],
              precip: [],
              humidity: [],
              conditions: [],
            };
          }
          dailyForecasts[date].temps.push(item.main.temp);
          dailyForecasts[date].winds.push(item.wind.speed * 3.6);
          dailyForecasts[date].precip.push(item.pop * 100);
          dailyForecasts[date].humidity.push(item.main.humidity);
          dailyForecasts[date].conditions.push(item.weather[0]);
        });

        const forecastday = Object.values(dailyForecasts).slice(0, 3).map(day => {
          const maxTemp = Math.max(...day.temps);
          const minTemp = Math.min(...day.temps);
          const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
          const maxWind = Math.max(...day.winds);
          const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
          const chanceOfRain = Math.max(...day.precip);
          
          const conditionCounts = {};
          let mainCondition = day.conditions[0];
          let maxCount = 0;
          day.conditions.forEach(cond => {
            conditionCounts[cond.id] = (conditionCounts[cond.id] || 0) + 1;
            if (conditionCounts[cond.id] > maxCount) {
              maxCount = conditionCounts[cond.id];
              mainCondition = cond;
            }
          });
      
          return {
            date: day.date,
            date_epoch: day.date_epoch,
            day: {
              maxtemp_c: maxTemp,
              maxtemp_f: (maxTemp * 9/5) + 32,
              mintemp_c: minTemp,
              mintemp_f: (minTemp * 9/5) + 32,
              avgtemp_c: avgTemp,
              avgtemp_f: (avgTemp * 9/5) + 32,
              maxwind_kph: maxWind,
              maxwind_mph: maxWind / 1.609,
              avghumidity: avgHumidity,
              daily_chance_of_rain: chanceOfRain,
              daily_will_it_rain: chanceOfRain > 50 ? 1 : 0,
              condition: {
                text: mainCondition.description,
                code: mainCondition.id
              }
            }
          };
        });

        return {
          location: {
            name: currentData.name,
            country: currentData.sys.country,
            lat: currentData.coord.lat,
            lon: currentData.coord.lon,
            localtime_epoch: currentData.dt,
            localtime: new Date(currentData.dt * 1000).toISOString()
          },
          current: {
            temp_c: currentData.main.temp,
            temp_f: (currentData.main.temp * 9/5) + 32,
            is_day: (currentData.dt > currentData.sys.sunrise && currentData.dt < currentData.sys.sunset) ? 1 : 0,
            condition: {
              text: currentData.weather[0].description,
              code: currentData.weather[0].id
            },
            wind_kph: currentData.wind.speed * 3.6,
            wind_mph: (currentData.wind.speed * 3.6) / 1.609,
            humidity: currentData.main.humidity,
            feelslike_c: currentData.main.feels_like,
            feelslike_f: (currentData.main.feels_like * 9/5) + 32,
          },
          forecast: {
            forecastday: forecastday
          }
        };
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Handle different types of errors appropriately
      if (error.response?.status === 429) {
        console.log('Too many requests');
        return getDemoWeatherData(location);
      }

      // Handle user input errors (city not found, typos, etc.) - let them through as errors
      if (error.response?.status === 400 || error.response?.status === 404) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('Location not found. Please check your spelling and try again.');
      }
      
      // Handle unauthorized errors (e.g., new API key not yet active)
      if (error.response?.status === 401) {
        console.log('API key is unauthorized or inactive. Using demo data.');
        return getDemoWeatherData(location);
      }
      
      // Handle Vercel service unavailability (500+ errors or network failures)
      if (!error.response || error.response?.status >= 500 || error.code === 'NETWORK_ERROR') {
        console.log('Vercel service unavailable, using demo data');
        return getDemoWeatherData(location);
      }
      
      // Handle other API errors normally
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },

  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude},${longitude}`);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    });
  }
};

export const getWeatherConditionType = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return 'sunny';
  }
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return 'stormy';
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloudy';
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rainy';
  }
  if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
    return 'snowy';
  }
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'foggy';
  }
  
  return 'cloudy';
};

export const isPartlyCloudy = (condition) => {
  if (!condition) return false;
  const conditionLower = condition.toLowerCase();
  return conditionLower.includes('partly') || conditionLower.includes('few clouds') || 
         conditionLower.includes('scattered') || conditionLower.includes('broken clouds');
};

export const shouldShowSun = (weatherData) => {
  if (!weatherData?.current?.condition?.text) return false;
  
  const currentCondition = weatherData.current.condition.text;
  const weatherType = getWeatherConditionType(currentCondition);
  const partlyCloudy = isPartlyCloudy(currentCondition);
  
  if (weatherType === 'sunny') {
    return true; // Sun always appears for sunny (with or without clouds)
  } else if (weatherType === 'cloudy') {
    return partlyCloudy; // Sun only appears if partly cloudy
  } else if (weatherType === 'rainy') {
    return false; // No sun - only clouds and rain
  } else if (weatherType === 'snowy') {
    return false; // No sun - only clouds and snow  
  } else if (weatherType === 'stormy') {
    return false; // No sun - storm effect only
  } else if (weatherType === 'foggy') {
    return false; // No sun - only clouds/fog
  } else {
    return partlyCloudy; // Default case shows sun only if partly cloudy
  }
};