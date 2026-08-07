export interface WeatherCodeInfo {
  name: string;
  icon: string;
}

// WMO weather codes as returned by Open-Meteo's `weathercode` field.
export const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { name: "Clear sky", icon: "☀️" },
  1: { name: "Mainly clear", icon: "🌤️" },
  2: { name: "Partly cloudy", icon: "⛅" },
  3: { name: "Overcast", icon: "☁️" },
  45: { name: "Fog", icon: "🌫️" },
  48: { name: "Rime fog", icon: "🌫️" },
  51: { name: "Light drizzle", icon: "🌦️" },
  53: { name: "Drizzle", icon: "🌦️" },
  55: { name: "Dense drizzle", icon: "🌦️" },
  56: { name: "Freezing drizzle", icon: "🌦️" },
  57: { name: "Freezing drizzle", icon: "🌦️" },
  61: { name: "Light rain", icon: "🌧️" },
  63: { name: "Rain", icon: "🌧️" },
  65: { name: "Heavy rain", icon: "🌧️" },
  66: { name: "Freezing rain", icon: "🌧️" },
  67: { name: "Freezing rain", icon: "🌧️" },
  71: { name: "Light snow", icon: "🌨️" },
  73: { name: "Snow", icon: "❄️" },
  75: { name: "Heavy snow", icon: "❄️" },
  77: { name: "Snow grains", icon: "❄️" },
  80: { name: "Rain showers", icon: "🌧️" },
  81: { name: "Rain showers", icon: "🌧️" },
  82: { name: "Violent showers", icon: "⛈️" },
  85: { name: "Snow showers", icon: "🌨️" },
  86: { name: "Heavy snow showers", icon: "❄️" },
  95: { name: "Thunderstorm", icon: "⛈️" },
  96: { name: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { name: "Severe thunderstorm", icon: "⛈️" },
};

export function getWeatherInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? { name: "Unknown", icon: "❔" };
}