"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import CryptoJS from "crypto-js";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// rest of your code...


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

export default function Home() {
  const [links, setLinks] = useState("");
  const [err, setError] = useState("");
  const [token, setToken] = useState("");
  const [disableInput, setDisableInput] = useState(false);

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
    if (error) {
      setDisableInput(false);
      setLinks("");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  }, [error]);

  async function submit() {
    setError("");
    setDisableInput(true);

    const linksArray = links.split(",").map((link) => link.trim());

    if (!linksArray.length) {
      setError("Please enter at least one link");
      setDisableInput(false);
      return;
    }

    const secretKey = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
    const expirationTime = Date.now() + 20000;
    const dataToEncrypt = JSON.stringify({
      token: linksArray,
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
    <header className="mb-6">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
        Downloader
      </h1>
    </header>
    <main className="flex flex-col items-center justify-center space-y-8">
      <div className="self-center text-black">
        <Input
          disabled={disableInput}
          className="max-w-80"
          placeholder="Enter the links (separated by commas)"
          onChange={(e) => setLinks(e.target.value)}
        />
      </div>
      <div className="self-center">
        <Button
          className="bg-green-600"
          disabled={disableInput}
          onClick={submit}
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
                {/* ... (loading SVG remains the same) */}
              </svg>
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
      {data && (
        <div className="my-10 py-10 bg-slate-700 rounded-lg items-start flex flex-col justify-start gap-2">
          <div className="w-full">
            <div className="rounded-md flex justify-center items-center ">
              <Image
                className="blur-md hover:filter-none rounded-md p-3 transition duration-300 ease-in-out transform scale-100 hover:scale-110 hover:rounded-md opacity-100 hover:opacity-100 "
                style={{ objectFit: "contain" }}
                loading="lazy"
                src={data?.thumbs?.url1}
                height={200}
                width={200}
                alt=""
              />
            </div>
          </div>
          <div className="pl-3 pt-3">
            <div className="pt-10"></div>
            <h1 className="text-sm lg:text-xl text-white ">
              Title:{" "}
              <span className="text-white  text-md lg:text-2xl font-bold ">
                {data?.server_filename}
              </span>
            </h1>
            <h1 className="text-sm lg:text-xl text-white ">
              File Size:{" "}
              <span className="text-white  text-md lg:text-2xl font-bold ">
                {getFormattedSize(data.size)}
              </span>
            </h1>
            <h1 className="text-sm lg:text-xl text-white ">
              Uploaded On:{" "}
              <span className="text-white  text-md lg:text-2xl font-bold ">
                {convertEpochToDateTime(data.server_ctime)}
              </span>
            </h1>
          </div>
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
        </div>
      )}
    </main>
  </div>
);
}
