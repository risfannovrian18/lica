'use client'

import Image from "next/image";
import Navbar from "@/components/Navbar";
import axios from 'axios';
import { useQuery } from "react-query";
import { format, parseISO } from 'date-fns';
import Container from "@/components/Container";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKelvinToCelcius } from "@/utils/convertKelvinToCelcius";


// https://api.openweathermap.org/data/2.5/forecast?q=bogor&appid=3fbbb481e063cfb75f1ac7781eb73341&cnt=56

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
  const { isLoading, error, data } = useQuery<WeatherResponse>(
    "repoData",
    async () =>
    {
      const {data} = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=bogor&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }

  );

  const firstData = data?.list[0];

  console.log('data', data);
  
  if (isLoading) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce">Loading...</p>
    </div>
  ); 
  /* if (error) return `Error: ${(error as Error).message}`; */

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* today data */}
        <section className="space-y-4">
          <div className="space-y-4">
            <h2 className="flex gap-1 text-2xl items-end">
              <p> { format(parseISO(firstData?.dt_txt ??'' ),'EEEE')} </p>
              <p className="text-lg"> ({ format(parseISO(firstData?.dt_txt ??'' ),'dd.MM.yyyy')}) </p>

            </h2>
            <Container className="gap-10 px-6 py-3 items-center">
              {/* temperature */}
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                {convertKelvinToCelcius(firstData?.main.temp ?? 305.36)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>
                    {convertKelvinToCelcius(firstData?.main.feels_like ?? 0)}°
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                  {convertKelvinToCelcius(firstData?.main.temp_min ?? 0)}°↓{" "}
                  </span>
                  <span>
                    {" "}
                  {convertKelvinToCelcius(firstData?.main.temp_max ?? 0)}°↑
                  </span>
                </p>
              </div>
              {/* time and waether icon */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-beetween pr-3">

                {data?.list.map((d,i)=>
                <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                  <p className="whitespace-nowrap">
                    {format(parseISO(d.dt_txt),'h.mm a')}
                  </p>

                  <p>
                  <WeatherIcon iconName={d.weather[0].icon}/>
                    {convertKelvinToCelcius(d?.main.temp ?? 0)}°
                    </p>


                </div>
                )}
              </div>
            </Container>
          </div>
        </section>

        {/* 7 day forcaset data */}
        <section></section>
      </main>
    </div>
  );
}
