import { NextResponse } from "next/server";
import axios from "axios";

import CryptoJS from "crypto-js";

function getFormattedSize(sizeBytes) {
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

function findBetween(str, start, end) {
  const startIndex = str.indexOf(start) + start.length;
  const endIndex = str.indexOf(end, startIndex);
  return str.substring(startIndex, endIndex);
}

const headers = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9,te;q=0.8",
  Connection: "keep-alive",
  Cookie: "browserid=XHuy0htaNqVVxpExvcKc3Y7TkwouDTUeiqGuI1XunMflp98n9XRKYy6hYWo=; lang=en; __bid_n=18d3633e2e5c80bcda4207; _ga=GA1.1.455855118.1706011461; __stripe_mid=1daea916-e2b4-4894-ad0e-f2335c5daba4a61128; g_state={\"i_l\":0}; ndus=YunKf8eteHuie01e9Sgimx5FfHRVFx0h57hRI-tD; csrfToken=-IjL7Ejm7yZ1zx5vKUan0N1p; ndut_fmt=27E6EE0AF97D183385EDBDBE825A9BBF335BFA820CFE8085BA65E651007CFBC5; _ga_06ZNKL8C2E=GS1.1.1706266451.5.1.1706266467.44.0.0",
  DNT: "1",
  Host: "www.1024tera.com",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
};



export async function GET(req, res) {
  const { searchParams: params } = new URL(req.url);
  if (!params.has("data")) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  const encryptedData = params.get("data");
  if (!encryptedData) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  const secretKey = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9g";
  let url;
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    const { token: decryptedToken, expiresAt } = JSON.parse(decryptedData);
    url = decryptedToken;
    console.log(url, expiresAt);
    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: "Expired token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return NextResponse.json(
      { error: "Invalid encrypted data" },
      { status: 400 }
    );
  }
  try {
    const req = await axios.get(url, { headers, withCredentials: true });
    const responseData = req.data;
    const jsToken = findBetween(responseData, "fn%28%22", "%22%29");
    const logid = findBetween(responseData, "dp-logid=", "&");
    if (!jsToken || !logid) {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }
    const { searchParams: requestUrl, href } = new URL(
      req.request.res.responseUrl
    );
    if (!requestUrl.has("surl")) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }
    const surl = requestUrl.get("surl");

    const params = {
      app_id: "250528",
      web: "1",
      channel: "dubox",
      clienttype: "0",
      jsToken: jsToken,
      dplogid: logid,
      page: "1",
      num: "20",
      order: "time",
      desc: "1",
      site_referer: href,
      shorturl: surl,
      root: "1",
    };

    const req2 = await axios.get("https://www.1024tera.com/share/list", {
      params,
      headers,
      withCredentials: true,
    });
    const responseData2 = req2.data;
    console.log(responseData2);
    if (!"list" in responseData2) {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }
    console.log(responseData2);
    return NextResponse.json(responseData2?.list[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Unknown Error" }, { status: 400 });
  }
}
