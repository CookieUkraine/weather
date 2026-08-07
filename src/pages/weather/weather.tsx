import { useEffect, useState, FormEvent } from "react";
import styled from "styled-components";
import { fetchWeatherSnapshot, searchCity, WeatherSnapshot } from "./weatherApi";
import { getWeatherInfo } from "./weatherCodes";
import { SkyCase } from "../../components/SkyCase/SkyCase";

const DEFAULT_LOCATION = {
  name: "New York",
  latitude: 40.7128,
  longitude: -74.0060,
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Weather() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchWeatherSnapshot(location.latitude, location.longitude)
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
          setStatus("ready");
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchStatus("Searching…");
    try {
      const result = await searchCity(query.trim());
      if (!result) {
        setSearchStatus(`No city found for "${query}".`);
        return;
      }
      setLocation({ name: result.name, latitude: result.latitude, longitude: result.longitude });
      setSearchStatus("");
      setQuery("");
    } catch (err) {
      console.error(err);
      setSearchStatus("Search failed. Try again.");
    }
  }

  return (
    <PageWrap>
      <TopBar>
        <Brand>
          <BrandMark>🌐</BrandMark>
          <BrandName>
            SKY<span>VAULT</span>
          </BrandName>
        </Brand>
        <SkyCase />
      </TopBar>

      <Hero>
        <HeroRow>
          <LocBlock>
            <Eyebrow>Current location</Eyebrow>
            <LocName>{location.name}</LocName>
            <LocCoords>
              {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
            </LocCoords>
            <SearchForm onSubmit={handleSearch}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a city…"
                autoComplete="off"
              />
              <button type="submit">Go</button>
            </SearchForm>
            <SearchStatus>{searchStatus}</SearchStatus>
          </LocBlock>

          <NowBlock>
            {status === "ready" && snapshot ? (
              <>
                <NowTemp>
                  <span>{getWeatherInfo(snapshot.current.weatherCode).icon}</span>
                  {Math.round(snapshot.current.temperature)}°
                </NowTemp>
                <NowDesc>{getWeatherInfo(snapshot.current.weatherCode).name}</NowDesc>
                <NowMeta>
                  <span>Wind {Math.round(snapshot.current.windSpeed)} km/h</span>
                  <span>Humidity {Math.round(snapshot.current.humidity)}%</span>
                </NowMeta>
              </>
            ) : status === "error" ? (
              <NowDesc>Unavailable</NowDesc>
            ) : (
              <NowDesc>Loading current conditions…</NowDesc>
            )}
          </NowBlock>
        </HeroRow>
      </Hero>

      <SectionHead>
        <SectionTitle>Past 7 days</SectionTitle>
        <SectionSub>Live data · Open‑Meteo forecast archive</SectionSub>
      </SectionHead>

      {status === "loading" && <Loading>Loading the last week of weather…</Loading>}
      {status === "error" && (
        <ErrorNote>Could not load weather data right now. Please try again in a moment.</ErrorNote>
      )}
      {status === "ready" && snapshot && (
        <WeekGrid>
          {snapshot.pastWeek.map((day, i) => {
            const info = getWeatherInfo(day.weatherCode);
            const isToday = i === snapshot.pastWeek.length - 1;
            return (
              <DayCard key={day.date.toISOString()} $today={isToday}>
                <DayName>{isToday ? "Today" : DAY_NAMES[day.date.getDay()]}</DayName>
                <DayDate>
                  {day.date.getDate()}/{day.date.getMonth() + 1}
                </DayDate>
                <DayIcon>{info.icon}</DayIcon>
                <DayTemps>
                  <b>{Math.round(day.tempMax)}°</b> <Lo>{Math.round(day.tempMin)}°</Lo>
                </DayTemps>
                {day.precipitation > 0 && <DayPrecip>{day.precipitation.toFixed(1)}mm</DayPrecip>}
              </DayCard>
            );
          })}
        </WeekGrid>
      )}

      <Footer>
        <span>Weather data: Open‑Meteo (open-meteo.com), no API key required.</span>
        <span>Sky Case rarities are for fun — not a real forecast.</span>
      </Footer>
    </PageWrap>
  );
}

export default Weather;

/* ---------------------------- styled components --------------------------- */

const PageWrap = styled.div`
  background: radial-gradient(ellipse 900px 500px at 15% -10%, rgba(79, 143, 232, 0.16), transparent 60%),
    radial-gradient(ellipse 700px 500px at 100% 0%, rgba(124, 92, 255, 0.14), transparent 55%), #060a14;
  color: #f3f6ff;
  min-height: 100vh;
  padding-bottom: 40px;
`;

const TopBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  max-width: 1080px;
  margin: 0 auto;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandMark = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f8fe8, #7c5cff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 0 22px rgba(124, 92, 255, 0.45);
`;

const BrandName = styled.div`
  font-weight: 700;
  letter-spacing: 0.04em;
  font-size: 17px;

  span {
    color: #4f8fe8;
  }
`;

const Wrap = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Hero = styled(Wrap).attrs({ as: "section" })`
  margin-top: 10px;
  background: linear-gradient(180deg, #0f1b33, rgba(15, 27, 51, 0.4));
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 34px;
`;

const HeroRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
`;

const Eyebrow = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11.5px;
  color: #93a0c4;
  font-weight: 600;
`;

const LocBlock = styled.div``;

const LocName = styled.div`
  font-size: 26px;
  font-weight: 600;
  margin: 6px 0 4px;
`;

const LocCoords = styled.div`
  font-size: 12.5px;
  color: #93a0c4;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 14px;

  input {
    background: #182849;
    border: 1px solid rgba(255, 255, 255, 0.09);
    color: #f3f6ff;
    padding: 9px 12px;
    border-radius: 9px;
    font-size: 13.5px;
    width: 190px;
  }
  button {
    background: #1f3260;
    border: 1px solid rgba(255, 255, 255, 0.09);
    color: #f3f6ff;
    padding: 9px 14px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover {
    border-color: #4f8fe8;
  }
`;

const SearchStatus = styled.div`
  font-size: 12px;
  color: #93a0c4;
  margin-top: 6px;
  min-height: 16px;
`;

const NowBlock = styled.div`
  text-align: right;

  @media (max-width: 720px) {
    text-align: left;
    width: 100%;
  }
`;

const NowTemp = styled.div`
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  justify-content: flex-end;

  span {
    font-size: 44px;
    margin-top: -4px;
  }

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
`;

const NowDesc = styled.div`
  font-size: 14.5px;
  color: #93a0c4;
  margin-top: 6px;
`;

const NowMeta = styled.div`
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  margin-top: 10px;
  font-size: 12px;
  color: #93a0c4;

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
`;

const SectionHead = styled(Wrap)`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 38px auto 14px;
`;

const SectionTitle = styled.div`
  font-size: 17px;
  font-weight: 600;
`;

const SectionSub = styled.div`
  font-size: 12px;
  color: #93a0c4;
`;

const WeekGrid = styled(Wrap)`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(4, 1fr);
    > *:nth-child(n + 5) {
      display: none;
    }
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    > *:nth-child(n + 4) {
      display: none;
    }
  }
`;

const DayCard = styled.div<{ $today: boolean }>`
  background: #0f1b33;
  border: 1px solid ${(p) => (p.$today ? "rgba(79,143,232,0.55)" : "rgba(255,255,255,0.09)")};
  box-shadow: ${(p) => (p.$today ? "0 0 0 1px rgba(79,143,232,0.25)" : "none")};
  border-radius: 14px;
  padding: 16px 10px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const DayName = styled.div`
  font-size: 11.5px;
  color: #93a0c4;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
`;

const DayDate = styled.div`
  font-size: 10.5px;
  color: #93a0c4;
`;

const DayIcon = styled.div`
  font-size: 26px;
  margin: 4px 0;
`;

const DayTemps = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const Lo = styled.span`
  color: #93a0c4;
  font-weight: 500;
`;

const DayPrecip = styled.div`
  font-size: 10.5px;
  color: #4f8fe8;
  margin-top: 2px;
`;

const Loading = styled(Wrap)`
  color: #93a0c4;
  font-size: 13.5px;
  padding: 20px 24px;
`;

const ErrorNote = styled(Loading)`
  color: #e8478b;
`;

const Footer = styled(Wrap).attrs({ as: "footer" })`
  margin-top: 50px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  font-size: 11.5px;
  color: #93a0c4;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;