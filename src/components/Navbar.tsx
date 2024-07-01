'use client'

import React, { use, useState } from 'react'
import { MdWbSunny, MdMyLocation, MdOutlineLocationOn } from "react-icons/md";
import SearchBox from './SearchBox';
import axios from 'axios';
import { error } from 'console';
import { loadingCityAtom, placeAtom } from '@/app/atom';
import { useAtom } from 'jotai';
import Link from 'next/link';
import Image from 'next/image';

type Props = {location?: string};

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

export default function Navbar({location}: Props) {
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [place, setPlace] = useAtom(placeAtom);
    const [_, setLoadingCity] = useAtom(loadingCityAtom);

    async function handleInputChange(value: string) {
        setCity(value);
        if(value.length >= 3) {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`
                );

                const suggestions = response.data.list.map((item:any) => item.name);
                setSuggestions(suggestions);
                setError('');
                setShowSuggestions(true);
            } catch (error) {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
        else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }

    function handleSuggestionClick(value: string) {
        setCity(value);
        setShowSuggestions(false);
    }

    function handleCurrentLocation() {
        if(navigator.geolocation){
           navigator.geolocation.getCurrentPosition(async(position) => {
            const {latitude, longitude} = position.coords;
            try {
                setLoadingCity(true);
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
                );
                setTimeout(() => {
                    setLoadingCity(false);
                    setPlace(response.data.name);
                }, 500);
            } catch (error) {
                setLoadingCity(false);
            }
           });
        }
    }

    function handleSubmitSearch(e:React.FormEvent<HTMLFormElement>) {
        setLoadingCity(true);
        e.preventDefault();
        if(suggestions.length==0){
            setError("Location not found");
            setLoadingCity(false);
        }
        else {
            setError('');
            setTimeout(() => {
                setLoadingCity(false);
                setPlace(city);
                setShowSuggestions(false);
            }, 500);
        }
    }


   return (
    <>
      <nav className='shadow-sm sticky top-0 left-0 z-50 bg-indigo-600'>
        <div className='h-[80px] w-full flex justify-between items-center max-w-auto px-3 mx-2'>
          <div className='flex items-center justify-center gap-2 pl-8'>
            <Image src="/images/LICA_logo.png" alt="Lica Logo" width={150} height={150} />
          </div>
          <section className='flex gap-2 items-center px-12'>
            <div className='flex gap-12 justify-between pr-12 text-gray-50 text-2xl md:text-xl'>
              <Link href="/" className="hover:opacity-80">Home</Link>
              <Link href="/news" className="hover:opacity-80">News</Link>
              <Link href="/contact" className="hover:opacity-80">Contact</Link>
            </div>
            <MdMyLocation 
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className='text-2xl text-gray-50 hover:opacity-80 cursor-pointer'/>
            <MdOutlineLocationOn className='text-3xl text-gray-50'/>
            <p className='text-gray-50 text-sm'> {location} </p>
            <div className='relative hidden md:flex'>
              <SearchBox value={city}
                onChange={(e) => handleInputChange(e.target.value)}
                onSubmit={handleSubmitSearch} />
              <SuggestionBox 
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error
                }}
              />
            </div>
          </section>
        </div>
      </nav>
      <section className="flex max-w-7xl px-3 md:hidden">
        <div className='relative'>
          <SearchBox value={city}
            onChange={(e) => handleInputChange(e.target.value)}
            onSubmit={handleSubmitSearch} />
          <SuggestionBox 
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error
            }}
          />
        </div>
      </section>
    </>
  );
}

function SuggestionBox({
    showSuggestions,
    suggestions,
    handleSuggestionClick,
    error
}: {
    showSuggestions: boolean;
    suggestions: string[];
    handleSuggestionClick: (item: string) => void;
    error: string;
}) {
    return (
        <>
            {((showSuggestions && suggestions.length > 1) || error) && (
                <ul className='mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2'>
                    {error && suggestions.length < 1 && (
                    <li className='text-red-500 p-1'>{error}</li>
                    )}
                    {suggestions.map((item, i) => (
                        <li 
                        key={i}
                        onClick={()=> handleSuggestionClick(item)}
                        className='cursor-pointer p-1 rounded hover:bg-gray-200'>
                            {item}
                        </li>
                    ))}
                    
                </ul>
            )}
        </> 
    );
}