import { useMemo, useRef } from "react";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useMachine } from "@xstate/react";
import canvasTxt from "canvas-txt";
import JSConfetti from "js-confetti";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { createMachine } from "xstate";

import Canvas from "./../components/Canvas";
import CanvasRecorder from "./../components/CanvasRecorder";
import { HEIGHT, PADDING, WIDTH } from "./../components/const";

const DynamicForm = dynamic(() => import("../components/Form"), {
  ssr: false,
});

interface Context {}

const Home: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const logOutputRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

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

  const [state, send] = useMachine(() =>
    createMachine<
      unknown,
      | {
          type: "RESET";
        }
      | {
          type: "RECORD";
        }
      | {
          type: "FINISH_RECORDING";
        }
      | {
          type: "FINISH_PROCESSING";
        }
      | {
          type: "DONE";
        },
      | { value: "weclome"; context: Context }
      | { value: "editing"; context: Context }
      | { value: "recording"; context: Context }
      | { value: "processing"; context: Context }
      | { value: "downloading"; context: Context }
    >(
      {
        predictableActionArguments: true,
        id: "recorder",
        initial: "welcome",
        context: {
          retries: 0,
        },
        states: {
          idle: {},
          welcome: {
            after: {
              // after 1 second, transition to yellow
              1000: { target: "editing", actions: ["fire"] },
            },
          },
          editing: {
            on: {
              RESET: "editing",
              RECORD: {
                target: "recording",
              },
            },
          },
          recording: {
            after: {
              // after 1 second, transition to yellow
              1000: { target: "recording" },
            },
            on: {
              FINISH_RECORDING: "processing",
            },
          },
          processing: {
            on: {
              FINISH_PROCESSING: "downloading",
            },
          },
          downloading: {
            on: {
              DONE: "editing",
            },
          },
        },
      },
      {
        actions: {
          fire: () => {
            fireConfetti();
          },
        },
      }
    )
  );

  const sources = useMemo(
    () => [textCanvasRef, canvasRef],
    [textCanvasRef, canvasRef]
  );

  const startRecording = async (rounds: number) => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const waitSomeTime = async (time: number) =>
      new Promise((resolve) => {
        setTimeout(resolve, time);
      });

    send("RECORD");

    const resultCanvas = resultCanvasRef.current;

    if (!resultCanvas) {
      return;
    }

    // Start recording
    const resultCanvasStream = resultCanvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(resultCanvasStream, {
      mimeType: "video/webm;codecs=vp9",
    });

    const recordedChunks: Blob[] = [];
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

    for (let i = 0; i < rounds; i++) {
      fireConfetti();
      await waitSomeTime(1000);
    }

    send("FINISH_RECORDING");

    mediaRecorder.stop();

    const ffmpeg = createFFmpeg({
      corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
    });

    ffmpeg.setLogging(true);
    ffmpeg.setLogger((log) => {
      const outputDiv = logOutputRef.current;

      if (!outputDiv) {
        return;
      }

      outputDiv.textContent = outputDiv.textContent + log.message;
    });

    await ffmpeg.load();

    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);

    ffmpeg.FS("writeFile", "test.webm", await fetchFile(url));

    await ffmpeg.run("-i", "test.webm", "-c:v", "libx264", "output.mp4");
    const videoData = ffmpeg.FS("readFile", "output.mp4");

    const finalUrl = URL.createObjectURL(
      new Blob([videoData.buffer], { type: "video/mp4" })
    );

    if (videoRef.current) {
      videoRef.current.src = finalUrl;
    }

    send("FINISH_PROCESSING");
  };

  const isProcessing = state.matches("processing");
  const isDownloading = state.matches("downloading");

  const showOverlay = isProcessing || isDownloading;

  return (
    <div className="grid grid-flow-col gap-1 w-screen h-screen grid-cols-[1fr_400px]">
      <div className="flex items-center justify-center">
        {state.matches("recording") ? (
          <div className="absolute flex justify-center items-center left-4 top-4 border-red-500 rounded-md border p-2">
            <span className="h-2 w-2 animate-ping inline-flex rounded-full bg-red-400 opacity-75"></span>
            <span className="ml-2">Recording</span>
          </div>
        ) : undefined}

        <Canvas ref={canvasRef} />
        <Canvas ref={textCanvasRef} />

        <CanvasRecorder sources={sources} ref={resultCanvasRef} />

        {showOverlay && (
          <div
            onClick={() => {
              send("DONE");
            }}
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-sm"
          >
            {isProcessing && (
              <>
                <h2 className="text-6xl animate-bounce">... processing ...</h2>
                <div
                  ref={logOutputRef}
                  className="bg-black text-white font-mono h-96 w-32 overflow-auto"
                ></div>
              </>
            )}

            <div className="flex flex-col">
              <video
                className="rounded-lg"
                style={{
                  display: isDownloading ? "block" : "none",
                  height: HEIGHT,
                  width: WIDTH,
                }}
                loop
                autoPlay
                controls
                ref={videoRef}
              />
              {isDownloading && (
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
          }}
          onSubmit={async (data: any) => {
            updateText(data.message, data.font);

            startRecording(Number.parseInt(data.rounds, 10));
          }}
        />
      </div>
    </div>
  );
};

export default Home;
