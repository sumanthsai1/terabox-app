import { NextResponse } from "next/server";
import axios from "axios";
import CryptoJS from "crypto-js";

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
  Host: "www.4funbox.com",
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
  let urls;
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    const { token: decryptedToken, expiresAt } = JSON.parse(decryptedData);
    urls = Array.isArray(decryptedToken) ? decryptedToken : [decryptedToken];
    console.log(urls, expiresAt);
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

  // Handle each URL individually
  const results = [];
  for (const url of urls) {
    try {
      const req1 = await axios.get(url, { headers, withCredentials: true });
      const responseData = req1.data;

      // Process the response as needed for your use case
      const jsToken = findBetween(responseData, "fn%28%22", "%22%29");
      const logid = findBetween(responseData, "dp-logid=", "&");

      if (!jsToken || !logid) {
        results.push({ error: "Invalid response" });
        continue;
      }

      // ... (rest of the code remains the same)

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

      const req2 = await axios.get("https://www.4funbox.com/share/list", {
        params,
        headers,
        withCredentials: true,
      });
      const responseData2 = req2.data;
      if (!("list" in responseData2)) {
        results.push({ error: "Invalid response" });
        continue;
      }
      results.push(responseData2?.list[0]); // Modify this based on your response structure
    } catch (error) {
      results.push({ error: "Unknown Error" });
    }
  }

  return NextResponse.json(results, { status: 200 });
}
