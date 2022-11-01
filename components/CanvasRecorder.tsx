import * as React from "react";

import { HEIGHT, WIDTH } from "./const";

const CanvasRecorder = React.forwardRef<
  HTMLCanvasElement,
  { sources: React.RefObject<HTMLCanvasElement>[] }
>(({ sources }, ref) => {
  React.useEffect(() => {
    if (typeof ref !== "function") {
      const canvas = ref?.current;
      const ctx = canvas?.getContext("2d");

      if (canvas && ctx) {
        const anim = () => {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          sources.map((source) => {
            if (source.current) {
              ctx.drawImage(source.current, 0, 0, canvas.width, canvas.height);
            }
          });

          requestAnimationFrame(anim);
        };
        anim();
      }
    }
  }, [sources, ref]);

  return (
    <canvas
      className="shadow-lg shadow-gray-500/50 rounded-lg"
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      style={{
        border: "1px solid red",
        top: 0,
        height: HEIGHT,
        width: WIDTH,
      }}
    />
  );
});

CanvasRecorder.displayName = "CanvasElement";

export default CanvasRecorder;
