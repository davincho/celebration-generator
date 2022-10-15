import { useEffect, useRef, useState } from "react";

import { Button, Input, Box } from "@chakra-ui/react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import confetti from "canvas-confetti";
import canvasTxt from "canvas-txt";
import type { NextPage } from "next";

import Canvas from "./../components/Canvas";

let recordedChunks = [];

const WIDTH = 600;
const HEIGHT = 400;

const PADDING = 100;

const Home: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder>();

  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textCanvas = textCanvasRef.current;
    const resultCanvas = resultCanvasRef.current;

    if (canvas && textCanvas && resultCanvas) {
      const resultCanvasStream = resultCanvas.captureStream(30);

      const stream = new MediaStream();

      stream.addTrack(resultCanvasStream.getVideoTracks()[0]);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      // videoRef.current.srcObject = stream;

      canvas.confetti =
        canvas.confetti || confetti.create(canvas, { resize: true });

      const ctx = resultCanvas.getContext("2d");

      const anim = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(textCanvas, 0, 0);
        ctx.drawImage(canvas, 0, 0);
        requestAnimationFrame(anim);
      };
      anim();
    }
  }, []);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          const canvas = textCanvasRef.current;

          if (canvas) {
            const ctx = canvas.getContext("2d");

            const txt = event.target.title.value;

            console.log(ctx);
            canvasTxt.fontSize = 24;

            canvasTxt.drawText(
              ctx,
              txt,
              PADDING,
              PADDING,
              WIDTH - PADDING,
              HEIGHT - PADDING
            );
          }
        }}
      >
        <Input
          name="title"
          defaultValue="🌟 30k stargazers 🌟"
          placeholder="Title"
        />
        <Button type="submit">Add</Button>
      </form>
      <Button
        onClick={() => {
          canvasRef.current.confetti({
            spread: 70,
            origin: { y: 1.2 },
          });
        }}
      >
        Confetti
      </Button>
      <Box position="relative" display="flex">
        <Canvas />
        <canvas
          style={{
            display: "none",
            backgroundColor: "red",
            top: 0,
            height: HEIGHT / 2,
            width: WIDTH / 2,
          }}
          ref={textCanvasRef}
          width={WIDTH}
          height={HEIGHT}
        />
        <canvas
          style={{
            position: "absolute",
            top: -99_999,
            left: -99_999,
            height: HEIGHT,
            width: WIDTH,
            backgroundColor: "green",
          }}
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
        />
      </Box>
      <canvas
        ref={resultCanvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          top: 0,
          height: HEIGHT,
          width: WIDTH,
          backgroundColor: "blue",
        }}
      />

      <Button
        colorScheme="blue"
        onClick={() => {
          setIsRecording(true);

          const mediaRecorder = mediaRecorderRef.current;

          if (mediaRecorder) {
            recordedChunks = [];
            mediaRecorder.ondataavailable = (e) => {
              console.log("DATA available");
              if (e.data.size > 0) {
                recordedChunks.push(e.data);
              }
            };
            mediaRecorder.onerror = (e) => {
              console.error("Nooo", e);
            };
            mediaRecorder.start();
          }
        }}
      >
        Start recording
      </Button>
      <button
        onClick={async () => {
          const mediaRecorder = mediaRecorderRef.current;

          if (mediaRecorder) {
            mediaRecorder.stop();

            const ffmpeg = createFFmpeg({
              corePath:
                "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
              log: true,
            });

            await ffmpeg.load();

            const blob = new Blob(recordedChunks, {
              type: "video/webm",
            });
            const url = URL.createObjectURL(blob);

            ffmpeg.FS("writeFile", "test.webm", await fetchFile(url));

            await ffmpeg.run(
              "-i",
              "test.webm",
              "-c:v",
              "libx264",
              "output.mp4"
            );
            const data = ffmpeg.FS("readFile", "output.mp4");

            const finalUrl = URL.createObjectURL(
              new Blob([data.buffer], { type: "video/mp4" })
            );

            // const a = document.createElement("a");
            // a.href = finalUrl;
            // a.download = "recording.mp4";
            // a.click();
            // URL.revokeObjectURL(finalUrl);

            if (videoRef.current) {
              videoRef.current.src = finalUrl;
            }
          }
        }}
      >
        Stop recording
      </button>
      <video
        style={{
          height: HEIGHT,
          width: WIDTH,
        }}
        autoPlay
        controls
        ref={videoRef}
      />
    </>
  );
};

export default Home;
