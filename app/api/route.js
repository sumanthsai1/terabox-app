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
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
  Connection: "keep-alive",
  Cookie:
    "csrfToken=x0h2WkCSJZZ_ncegDtpABKzt; browserid=Bx3OwxDFKx7eOi8np2AQo2HhlYs5Ww9S8GDf6Bg0q8MTw7cl_3hv7LEcgzk=; lang=en; TSID=pdZVCjBvomsN0LnvT407VJiaJZlfHlVy; __bid_n=187fc5b9ec480cfe574207; ndus=Y-ZNVKxteHuixZLS-xPAQRmqh5zukWbTHVjen34w; __stripe_mid=895ddb1a-fe7d-43fa-a124-406268fe0d0c36e2ae; ndut_fmt=FF870BBFA15F9038B3A39F5DDDF1188864768A8E63DC6AEC54785FCD371BB182",
  DNT: "1",
  Host: "www.1024tera.com",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  "sec-ch-ua":
    '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
};

// ... (existing functions and headers remain the same)

async function sendMessage(chatId, text) {
  const botToken = "6967803453:AAESYXs9tO8nUazRVLw8dL8h-RozIHjGx80"; // Replace with your bot token
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const params = new URLSearchParams({
    chat_id: chatId,
    text: text,
  });

  const response = await fetch(`${apiUrl}?${params.toString()}`);
  const data = await response.json();
  return data;
}

export async function GET(req, res) {
  const { searchParams: params } = new URL(req.url);
  if (!params.has("data")) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  const encryptedData = params.get("data");
  if (!encryptedData) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  const secretKey = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
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

    const chatId = "6967803453"; // Replace with the actual chatId
    await sendMessage(chatId, `Error: Invalid encrypted data`);

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
      const chatId = "6967803453"; // Replace with the actual chatId
      await sendMessage(chatId, `Error: Invalid response`);

      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }
    const { searchParams: requestUrl, href } = new URL(
      req.request.res.responseUrl
    );
    if (!requestUrl.has("surl")) {
      const chatId = "6967803453"; // Replace with the actual chatId
      await sendMessage(chatId, `Error: Missing data`);

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
    if (!("list" in responseData2)) {
      const chatId = "6967803453"; // Replace with the actual chatId
      await sendMessage(chatId, `Error: Invalid response`);

      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }

    // Assuming you have a chatId from the Telegram message
    const chatId = "6967803453"; // Replace with the actual chatId

    // Sending the final URL to the Telegram bot
    const finalUrl = responseData2?.list[0]?.dlink || "Error: Final URL not available";
    await sendMessage(chatId, `Final URL: ${finalUrl}`);

    return NextResponse.json(responseData2?.list[0], { status: 200 });
  } catch (error) {
    console.error("Error:", error);

    // Sending an error message to the Telegram bot
    const chatId = "6967803453"; // Replace with the actual chatId
    await sendMessage(chatId, `Error: ${error.message}`);

    return NextResponse.json({ error: "Unknown Error" }, { status: 400 });
  }
}
