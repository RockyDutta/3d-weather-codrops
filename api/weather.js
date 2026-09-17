// Simple in-memory cache that works locally and on Vercel
const cache = new Map();
const rateLimitMap = new Map();

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
// For testing: temporarily set to 2 requests to test rate limiting quickly
// Change back to 20 for production
const MAX_REQUESTS_PER_HOUR = 15;

// Helper function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         '127.0.0.1';
}

// Rate limiting function
function isRateLimited(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS_PER_HOUR) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  return false;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { location } = req.query;
  
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required' });
  }
  
  // Rate limiting with fallback data
  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}, serving demo data`);
    
    // Return realistic dummy weather data
    const demoWeatherData = {
      location: {
        name: "Demo City",
        region: "Demo State",
        country: "Demo Country", 
        lat: 40.7128,
        lon: -74.0060,
        tz_id: "America/New_York",
        localtime_epoch: Math.floor(Date.now() / 1000),
        localtime: new Date().toISOString().slice(0, -5) // Remove Z and milliseconds
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
          // Tomorrow
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
          // Day after tomorrow
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
      cached: false
    };
    
    return res.json(demoWeatherData);
  }
  
  // Check cache first
  const cacheKey = `weather:${location.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for location: ${location}`);
    return res.json({
      ...cachedData.data,
      cached: true,
      cacheAge: Math.round((Date.now() - cachedData.timestamp) / 1000)
    });
  }
  
  // Make API call to OpenWeatherMap
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || process.env.WEATHER_API_KEY;
  
  if (!API_KEY) {
    console.error('Weather API key not found');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  try {
    const encodedLocation = encodeURIComponent(location);
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodedLocation}&appid=${API_KEY}&units=metric`)
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      const errorData = await currentResponse.json().catch(() => ({}));
      return res.status(currentResponse.status).json({ 
        error: errorData.message || 'Weather API error',
        code: errorData.cod
      });
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Map OpenWeatherMap data to the WeatherAPI format expected by the frontend
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

    const weatherData = {
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
    
    // Cache the response
    cache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });
    
    console.log(`API call made for location: ${location}, cached for ${CACHE_DURATION / 1000 / 60} minutes`);
    
    // Clean up old cache entries (simple cleanup)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    res.json({
      ...weatherData,
      cached: false
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}