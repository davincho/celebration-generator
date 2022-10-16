import { useEffect, useRef, useState } from "react";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import canvasTxt from "canvas-txt";
import JSConfetti from "js-confetti";
import type { NextPage } from "next";
import dynamic from "next/dynamic";

import Canvas from "./../components/Canvas";
import CanvasRecorder from "./../components/CanvasRecorder";
import { HEIGHT, PADDING, WIDTH } from "./../components/const";

let recordedChunks: Blob[] = [];

const DynamicForm = dynamic(() => import("../components/Form"), {
  ssr: false,
});

const Home: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder>();

  const [recorderState, setRecorderState] = useState<
    "idle" | "reording" | "processing" | "finished"
  >("idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    const textCanvas = textCanvasRef.current;
    const resultCanvas = resultCanvasRef.current;

    if (canvas && textCanvas && resultCanvas) {
      const resultCanvasStream = resultCanvas.captureStream(30);

      mediaRecorderRef.current = new MediaRecorder(resultCanvasStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      // videoRef.current.srcObject = resultCanvasStream;
    }
  }, []);

  const updateText = (txt: string, font = "monospace") => {
    if (!txt) {
      return;
    }

    const canvas = textCanvasRef.current;

    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      canvasTxt.fontSize = 80;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";

      canvasTxt.font = font;

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

  const fireConfetti = () => {
    if (canvasRef.current) {
      const jsConfetti = new JSConfetti({
        canvas: canvasRef.current,
      });

      jsConfetti.addConfetti({
        emojis: ["⚡️", "💥", "✨"],
      });
    }
  };

  const showOverlay =
    recorderState === "processing" || recorderState === "finished";

  return (
    <div className="grid grid-flow-col gap-1 w-screen h-screen grid-cols-[1fr_min(200px,_1fr)]">
      <div className="flex items-center">
        <Canvas ref={canvasRef} />
        <Canvas ref={textCanvasRef} />

        <CanvasRecorder
          sources={[textCanvasRef, canvasRef]}
          ref={resultCanvasRef}
        />

        {showOverlay && (
          <div
            onClick={() => {
              setRecorderState("idle");
            }}
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-sm"
          >
            {recorderState === "processing" && (
              <h2 className="text-6xl animate-bounce">... processing ...</h2>
            )}

            <div className="flex flex-col">
              <video
                className="rounded-lg"
                style={{
                  display: recorderState === "finished" ? "block" : "none",
                  height: HEIGHT,
                  width: WIDTH,
                }}
                loop
                autoPlay
                controls
                ref={videoRef}
              />
              {recorderState === "finished" && (
                <button
                  className="bg-green-600 p-4 mt-1 rounded-lg text-white text-xl"
                  onClick={() => {
                    if (!videoRef.current) {
                      return;
                    }

                    const a = document.createElement("a");
                    a.href = videoRef.current.src;
                    a.download = "recording.mp4";
                    a.click();
                  }}
                >
                  🦄 Download video
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4">
        <DynamicForm
          onDataChanged={(data: any) => {
            updateText(data.message, data.font);

            if (data.confetti) {
              fireConfetti();
            }
          }}
          onSubmit={async () => {
            // eslint-disable-next-line unicorn/consistent-function-scoping
            const waitSomeTime = async (time: number) =>
              new Promise((resolve) => {
                setTimeout(resolve, time);
              });

            // Start recording
            const mediaRecorder = mediaRecorderRef.current;

            if (!mediaRecorder) {
              // eslint-disable-next-line no-console
              console.error("No media recorder instance found");
              return;
            }

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

            fireConfetti();

            await waitSomeTime(4000);

            setRecorderState("processing");

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
            const videoData = ffmpeg.FS("readFile", "output.mp4");

            const finalUrl = URL.createObjectURL(
              new Blob([videoData.buffer], { type: "video/mp4" })
            );

            if (videoRef.current) {
              videoRef.current.src = finalUrl;
            }

            setRecorderState("finished");
          }}
        />
      </div>
    </div>
  );
};

export default Home;
