import { fetchWeatherApi } from "openmeteo";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export interface DayWeather {
  date: Date;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
}

export interface WeatherSnapshot {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  pastWeek: DayWeather[];
}

/**
 * Fetches current conditions plus the last 7 days of daily weather
 * for a given coordinate pair.
 */
export async function fetchWeatherSnapshot(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const params = {
    latitude,
    longitude,
    current: ["temperature_2m", "weathercode", "wind_speed_10m", "relative_humidity_2m"],
    daily: ["weathercode", "temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
    past_days: 7,
    forecast_days: 1,
    timezone: "auto",
  };

  const responses = await fetchWeatherApi(FORECAST_URL, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current()!;
  const daily = response.daily()!;

  // Order here must match the order of the `current` array above.
  const currentWeather: CurrentWeather = {
    temperature: current.variables(0)!.value(),
    weatherCode: current.variables(1)!.value(),
    windSpeed: current.variables(2)!.value(),
    humidity: current.variables(3)!.value(),
  };

  const dailyTimes = Array.from(
    { length: (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval() },
    (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
  );

  // Order here must match the order of the `daily` array above.
  const codes = daily.variables(0)!.valuesArray()!;
  const tempMax = daily.variables(1)!.valuesArray()!;
  const tempMin = daily.variables(2)!.valuesArray()!;
  const precipitation = daily.variables(3)!.valuesArray()!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // past_days=7 + forecast_days=1 returns 8 entries; keep only days up to
  // and including today, then take the most recent 7 (the past week).
  const pastWeek: DayWeather[] = dailyTimes
    .map((date, i) => ({
      date,
      weatherCode: codes[i],
      tempMax: tempMax[i],
      tempMin: tempMin[i],
      precipitation: precipitation[i],
    }))
    .filter((day) => day.date.getTime() <= today.getTime())
    .slice(-7);

  return {
    latitude: response.latitude(),
    longitude: response.longitude(),
    current: currentWeather,
    pastWeek,
  };
}

export interface CitySearchResult {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Looks up a city by name and returns its coordinates.
 * Returns null if no match was found.
 */
export async function searchCity(query: string): Promise<CitySearchResult | null> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const r = data.results[0];
  return {
    name: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}, ${r.country_code}`,
    latitude: r.latitude,
    longitude: r.longitude,
  };
}