"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import useSWR from "swr";
import CryptoJS from "crypto-js";

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
    // Add more Terabox domains here
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

  // Check if URL is valid
  if (!isValidUrl(url)) return false;

  // Check against Terabox patterns
  for (const pattern of patterns) {
    if (pattern.test(url)) return true;
  }

  return false;
}

export default function Home() {
  const [link, setLink] = useState("");
  const [err, setError] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const [token, setToken] = useState("");

  // Update SWR config
  const { data, error, isLoading } = useSWR(
    token ? [`/api?data=${encodeURIComponent(token)}`] : null,
    fetchWithToken,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  useEffect(() => {
    if (data || error) {
      setDisableInput(false);
      setLink("");
    }

    if (err || error) {
      setTimeout(() => setError(""), 5000);
    }
  }, [err, error, data]);

  async function Submit() {
    setError("");
    setDisableInput(true);

    if (!link) {
      setError("Please enter a link");
      return;
    }

    if (!checkUrlPatterns(link)) {
      setError("Invalid Link");
      return;
    }

    const secretKey = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
 // Store key in environment variable
    const expirationTime = Date.now() + 600000; // Increase token expiration time to 10 minutes

    const dataToEncrypt = JSON.stringify({
      token: link,
      expiresAt: expirationTime,
    });

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, secretKey).toString();
    setToken(encryptedData);
  }
  return (
    <div className="pt-6 mx-12">
      <nav className="flex justify-between ">
        <div className="self-center">
          <Link href="/">Terabox Downloader</Link>
        </div>
        <ul>
          <li>
            <Button className="bg-blue-600">
              <Link href="https://t.me/RoldexVerse">Telegram</Link>
            </Button>
          </li>
        </ul>
      </nav>
      <main className="mt-6 py-10 bg-slate-700 rounded-lg items-center flex flex-col justify-center gap-2">
        <h1 className="text-xl sm:text-3xl font-bold text-center text-white">
          Terabox Downloader
        </h1>
        <p className="text-center text-white">Enter your Terabox link below</p>
        <div className="flex flex-col justify-center ">
          <div className="self-center text-black">
            <Input
              disabled={disableInput}
              className="max-w-80"
              placeholder="Enter the link"
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
        </div>
        <div className="self-center">
          <Button
            className="bg-green-600"
            disabled={disableInput}
            onClick={Submit}
          >
            {isLoading && (
              <div role="status">
                <span className="sr-only">Loading...</span>
              </div>
            )}
            Download
          </Button>
        </div>
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
          <Link
            href={data?.dlink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-0 text-xl font-bold text-white self-center"
          >
            <Button
              variant="default"
              className="py-0 bg-blue-700 mt-3 text-xl font-bold"
            >
              {" "}
              Download
            </Button>
          </Link>
        </main>
      )}
    </div>
  );
}
