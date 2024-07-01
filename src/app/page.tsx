'use client';

import Navbar from "@/components/Navbar";
import axios from 'axios';
import { useQuery } from "react-query";
import { format, fromUnixTime, parseISO, isValid } from 'date-fns';
import Container from "@/components/Container";
import WeatherIcon from "@/components/WeatherIcon";
import WeatherDetails from "@/components/WeatherDetails";
import ForcastWeatherDetail from "@/components/ForcastWeatherDetail";
import { convertKelvinToCelcius } from "@/utils/convertKelvinToCelcius";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { metersToKilometers } from './../utils/metersToKilometers';
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";


interface WeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherData[];
  city: City;
}

interface WeatherData {
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain?: Rain;
  sys: Sys;
  dt_txt: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Clouds {
  all: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Rain {
  '3h': number;
}

interface Sys {
  pod: string;
}

interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

interface Coord {
  lat: number;
  lon: number;
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherResponse>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list?.[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading || loadingCity) {
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;

  const isValidDate = (dateString: string) => {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate);
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city?.name} />
      <main className="px-12 max-w-auto mx-auto flex flex-col gap-9 w-full pb-10 pt-4"
      // style={{
      //   backgroundImage: `url('/images/background.png')`, // Menggunakan gambar latar belakang dari file lokal
      //   backgroundSize: 'cover', // Menyesuaikan gambar agar mengisi latar belakang
      //   backgroundPosition: 'center', // Posisi gambar latar belakang di tengah-tengah halaman
      // }}
      >
        <section className="space-y-4">
          <div className="space-y-4">
            <h2 className="flex gap-1 text-2xl items-end">
              <p>{firstData && isValidDate(firstData.dt_txt) ? format(parseISO(firstData.dt_txt), 'EEEE') : 'Invalid Date'}</p>
              <p className="text-lg">({firstData && isValidDate(firstData.dt_txt) ? format(parseISO(firstData.dt_txt), 'dd.MM.yyyy') : 'Invalid Date'})</p>
            </h2>
            <Container className="gap-10 px-6 py-3 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelcius(firstData?.main.temp ?? 305.36)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>{convertKelvinToCelcius(firstData?.main.feels_like ?? 0)}°</span>
                </p>
                <p className="text-xs space-x-2">
                  <span>{convertKelvinToCelcius(firstData?.main.temp_min ?? 0)}°↓ </span>
                  <span>{convertKelvinToCelcius(firstData?.main.temp_max ?? 0)}°↑</span>
                </p>
              </div>
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((d, i) => {
                  const validDtTxt = isValidDate(d.dt_txt);
                  return (
                    <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                      <p className="whitespace-nowrap">
                        {validDtTxt ? format(parseISO(d.dt_txt), 'h.mm a') : 'Invalid Time'}
                      </p>
                      <WeatherIcon iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)} />
                      <p>{convertKelvinToCelcius(d?.main.temp ?? 0)}°</p>
                    </div>
                  );
                })}
              </div>
            </Container>
          </div>

          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center pt-2">{firstData?.weather[0].description}</p>
              <WeatherIcon iconName={getDayOrNightIcon(firstData?.weather[0].icon ?? "", firstData?.dt_txt ?? "")} />
            </Container>

            <Container className="bg-yellow-300/80 px-6 py-3 gap-4 justify justify-between overflow-x-auto">
              <WeatherDetails
                visability={metersToKilometers(firstData?.visibility ?? 10000)}
                airPressure={`${firstData?.main.pressure} hPa`}
                humidity={`${firstData?.main.humidity}%`}
                sunrise={format(fromUnixTime(data?.city.sunrise ?? 1718838135), "H:mm")}
                sunset={format(fromUnixTime(data?.city.sunset ?? 1718880393), "H:mm")}
                windSpeed={convertWindSpeed(firstData?.wind.speed ?? 0)}
              />
            </Container>
          </div>
        </section>

        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 days)</p>
          {firstDataForEachDate.map((d, i) => {
            const validDtTxt = isValidDate(d?.dt_txt ?? "");
            return (
              <ForcastWeatherDetail
                key={i}
                description={d?.weather[0].description ?? ""}
                weatherIcon={d?.weather[0].icon ?? "01d"}
                date={validDtTxt ? format(parseISO(d?.dt_txt ?? ""), "dd.MM") : 'Invalid Date'}
                day={validDtTxt ? format(parseISO(d?.dt_txt ?? ""), "EEEE") : 'Invalid Day'}
                feels_like={d?.main.feels_like ?? 0}
                temp={d?.main.temp ?? 0}
                temp_max={d?.main.temp_max ?? 0}
                temp_min={d?.main.temp_min ?? 0}
                airPressure={`${d?.main.pressure ?? 0} hPa`}
                humidity={`${d?.main.humidity ?? 0}%`}
                sunrise={format(fromUnixTime(data?.city.sunrise ?? 1718838135), "H:mm")}
                sunset={format(fromUnixTime(data?.city.sunset ?? 1718880393), "H:mm")}
                visability={`${metersToKilometers(d?.visibility ?? 10000)}`}
                windSpeed={`${convertWindSpeed(d?.wind.speed ?? 0)}`}
              />
            );
          })}
        </section>
      </main>
    </div>
  );
}
