const express = require("express");
const fs = require("fs");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/streamingservice", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("No range in the headers!");
  }

  const video = "selectYourMP4";
  const vidSize = fs.statSync(video).size;
  const chunkSize = 10 ** 7; //10MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, vidSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${vidSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(video, { start, end });

  videoStream.on("data", (chunk) => {
    res.write(chunk);
  });
  videoStream.on("end", () => {
    res.end();
  });
  videoStream.on("error", (error) => {
    console.log(error);
    res.end("OOPS! Something went wrong.");
  });
  //   videoStream.pipe(res);
});

app.listen(8080, () => {
  console.log("Listening to port 8080");
});
