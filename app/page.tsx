"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import useSWR from "swr";
import CryptoJS from "crypto-js";
import Image from "next/image";

const fetchWithToken = async (url: URL | RequestInfo) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorRes = await res.json();
    const error = new Error();
    error.message = errorRes?.error;
    throw error;
  }

  return await res.json();
};

function getFormattedSize(sizeBytes: number) {
  let size, unit;

  if (sizeBytes >= 1024 * 1024) {
    size = sizeBytes / (1024 * 1024);
    unit = "MB";
  } else if (sizeBytes >= 1024) {
    size = sizeBytes / 1024;
    unit = "KB";
  } else {
    size = sizeBytes;
    unit = "bytes";
  }

  return `${size.toFixed(2)} ${unit}`;
}

function convertEpochToDateTime(epochTimestamp: number) {
  const normalDate = new Date(epochTimestamp * 1000);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formattedDate = normalDate.toLocaleDateString(undefined, options);
  return formattedDate;
}

function isValidUrl(url: string | URL) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function checkUrlPatterns(url: string) {
  const patterns = [
    /ww\.mirrobox\.com/,
    /www\.nephobox\.com/,
    /freeterabox\.com/,
    /www\.freeterabox\.com/,
    /1024tera\.com/,
    /4funbox\.co/,
    /www\.4funbox\.com/,
    /mirrobox\.com/,
    /nephobox\.com/,
    /terabox\.app/,
    /terabox\.com/,
    /www\.terabox\.ap/,
    /terabox\.fun/,
    /www\.terabox\.com/,
    /www\.1024tera\.co/,
    /www\.momerybox\.com/,
    /teraboxapp\.com/,
    /momerybox\.com/,
    /tibibox\.com/,
    /www\.tibibox\.com/,
    /www\.teraboxapp\.com/,
  ];

  if (!isValidUrl(url)) {
    return false;
  }

  for (const pattern of patterns) {
    if (pattern.test(url)) {
      return true;
    }
  }

  return false;
}

export default function Home() {
  const [link, setLink] = useState("");
  const [err, setError] = useState("");
  const [token, setToken] = useState("");
  const [disableInput, setdisableInput] = useState(false);

  const { data, error, isLoading } = useSWR(
    token ? [`/api?data=${encodeURIComponent(token)}`] : null,
    ([url]) => fetchWithToken(url),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  useEffect(() => {
    if (data || error) {
      setdisableInput(false);
      setLink("");
    }
    if (err || error) {
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  }, [err, error, data]);

  async function Submit() {
    setError("");
    setdisableInput(true);
    if (!link) {
      setError("Please enter a link");
      return;
    }
    if (!checkUrlPatterns(link)) {
      setError("Invalid Link");
      return;
    }
    const secretKey = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
    const expirationTime = Date.now() + 20000;
    const dataToEncrypt = JSON.stringify({
      token: link,
      expiresAt: expirationTime,
    });
    const encryptedData = CryptoJS.AES.encrypt(
      dataToEncrypt,
      secretKey
    ).toString();
    setToken(encryptedData);
  }

  

  return (
    <div className="pt-6 mx-12">
      <nav className="flex justify-between">
        {/* ... (existing navigation code) */}
      </nav>
      <main className="mt-6 py-10 bg-slate-700 rounded-lg items-center flex flex-col justify-center gap-2">
        <h1 className="text-xl sm:text-3xl font-bold text-center text-white">
          Terabox Downloader
        </h1>
        <p className="text-center text-white">Enter your Terabox link below</p>
        {/* ... (existing input and button code) */}
        <Link
          href={data?.dlink}
          target="_blank"
          rel="noopener noreferrer"
          className="py-0 text-xl font-bold text-white self-center"
        >
          <a
            className="py-0 bg-blue-700 mt-3 text-xl font-bold"
            disabled={disableInput}
          >
            {isLoading && (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* ... (existing loading spinner code) */}
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            )}
            Download
          </a>
        </Link>
        {error && (
          <p className="bg-rose-500 text-white w-full text-center">
            {error.message}
          </p>
        )}
        {err && (
          <p className="bg-rose-500 text-white w-full text-center">{err}</p>
        )}
      </main>
      {data && (
        <main className="my-10 py-10 bg-slate-700 rounded-lg items-start flex flex-col justify-start gap-2">
          <div className="w-full">
            {/* ... (existing image code) */}
          </div>
          <div className="pl-3 pt-3">
            {/* ... (existing file details code) */}
          </div>
          {/* Remove the Link component and directly display the final URL */}
          <p className="text-white">
            Final URL:{" "}
            <a href={data?.dlink} target="_blank" rel="noopener noreferrer">
              {data?.dlink}
            </a>
          </p>
        </main>
      )}
    </div>
  );
}

  
