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
  const [links, setLinks] = useState("");
  const [err, setError] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [disableInput, setdisableInput] = useState(false);

  const { data, error, isLoading } = useSWR(
    tokens.length > 0 ? [`/api?data=${encodeURIComponent(JSON.stringify({ tokens }))}`] : null,
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
      setLinks("");
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
    if (!links) {
      setError("Please enter links");
      return;
    }
    
    const linksArray = links.split(",").map(link => link.trim());

    if (linksArray.length === 0) {
      setError("Please enter valid links");
      return;
    }

    if (!linksArray.every(checkUrlPatterns)) {
      setError("Invalid Link(s)");
      return;
    }

    const secretKey = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
    const expirationTime = Date.now() + 20000;
    const dataToEncrypt = JSON.stringify({
      tokens: linksArray,
      expiresAt: expirationTime,
    });
    const encryptedData = CryptoJS.AES.encrypt(
      dataToEncrypt,
      secretKey
    ).toString();
    setTokens([encryptedData]);
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
        <p className="text-center text-white">Enter your Terabox links below (separated by commas)</p>
        <div className="flex flex-col justify-center ">
          <div className="self-center text-black">
            <Input
              disabled={disableInput}
              className="max-w-80"
              placeholder="Enter the links"
              onChange={(e) => setLinks(e.target.value)}
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
      {data && data.map((result, index) => (
        <main key={index} className="my-10 py-10 bg-slate-700 rounded-lg items-start flex flex-col justify-start gap-2">
          <div className="w-full">
            <div className="rounded-md flex justify-center items-center ">
              <Image
                className="blur-md hover:filter-none rounded-md p-3 transition duration-300 ease-in-out transform scale-100 hover:scale-110 hover:rounded-md opacity-100 hover:opacity-100 "
                style={{ objectFit: "contain" }}
                loading="lazy"
                src={result?.thumbs?.url1}
                height={200}
                width={200}
                alt={""}
              />
            </div>
          </div>
          <div className="pl-3 pt-3">
            <div className="pt-10"></div>
            <h1 className="text-sm lg:text-xl text-white ">
              Title:{" "}
              <span className="text-white  text-md lg:text-2xl font-bold ">
                {result?.server_filename}
              </span>
            </h1>
            <h1 className="text-sm lg:text-xl text-white ">
              File Size:{" "}
              <span className="text-white text-md lg:text-2xl font-bold ">
                {getFormattedSize(result.size)}
              </span>
            </h1>
            <h1 className="text-sm lg:text-xl text-white ">
              Uploaded On:{" "}
              <span className="text-white  text-md lg:text-2xl font-bold ">
                {convertEpochToDateTime(result.server_ctime)}
              </span>
            </h1>
          </div>
          <Link
            href={result?.dlink}
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
      ))}
    </div>
  );
}
