import { ChangeEventHandler, useEffect, useRef, useState } from "react";

import { Button, Input, Checkbox } from "@chakra-ui/react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import canvasTxt from "canvas-txt";
import JSConfetti from "js-confetti";
import type { NextPage } from "next";

import Canvas from "./../components/Canvas";
import CanvasRecorder from "./../components/CanvasRecorder";
import { HEIGHT, PADDING, WIDTH } from "./../components/const";

let recordedChunks: Blob[] = [];

const Home: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder>();

  const [isRecording, setIsRecording] = useState(false);

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
    }
  }, []);

  const updateText: ChangeEventHandler<HTMLInputElement> = (event) => {
    const canvas = textCanvasRef.current;

    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      const txt = event.target.value;

      canvasTxt.fontSize = 80;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";

      canvasTxt.drawText(
        ctx,
        txt,
        PADDING,
        PADDING,
        WIDTH - 2 * PADDING,
        HEIGHT - 2 * PADDING
      );
    }
  };

  return (
    <>
      <Input
        onChange={updateText}
        name="title"
        defaultValue="🌟 30k stargazers 🌟"
        placeholder="Title"
      />

      <Checkbox>With Confetti</Checkbox>
      <Button
        onClick={() => {
          if (canvasRef.current) {
            const jsConfetti = new JSConfetti({ canvas: canvasRef.current });

            jsConfetti.addConfetti({
              emojis: ["⚡️", "💥", "✨"],
            });
          }
        }}
      >
        Confetti
      </Button>

      <Canvas ref={canvasRef} />
      <Canvas ref={textCanvasRef} />

      <CanvasRecorder
        sources={[textCanvasRef, canvasRef]}
        ref={resultCanvasRef}
      />

      <Button
        colorScheme="blue"
        onClick={() => {
          setIsRecording(true);

          const mediaRecorder = mediaRecorderRef.current;

          if (mediaRecorder) {
            recordedChunks = [];
            mediaRecorder.addEventListener("dataavailable", (event) => {
              if (event.data.size > 0) {
                recordedChunks.push(event.data);
              }
            });
            mediaRecorder.addEventListener("error", (event) => {
              // eslint-disable-next-line no-console
              console.error("Got and error while recording:", event);
            });
            mediaRecorder.start();

            setIsRecording(true);
          }
        }}
      >
        {isRecording ? "Recording ..." : "Start recording"}
      </Button>
      <button
        onClick={async () => {
          setIsRecording(false);
          const mediaRecorder = mediaRecorderRef.current;

          if (mediaRecorder) {
            mediaRecorder.stop();

            const ffmpeg = createFFmpeg({
              corePath:
                "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
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
        loop
        autoPlay
        controls
        ref={videoRef}
      />
    </>
  );
};

export default Home;
