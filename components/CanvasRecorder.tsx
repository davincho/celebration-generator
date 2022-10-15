import * as React from "react";

import { HEIGHT, WIDTH } from "./const";

const CanvasRecorder = React.forwardRef<
  HTMLCanvasElement,
  { sources: React.RefObject<HTMLCanvasElement>[] }
>(({ sources }, ref) => {
  React.useEffect(() => {
    const canvas = ref?.current;

    if (ref) {
      const ctx = canvas.getContext("2d");

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
  }, [sources, ref]);

  return (
    <canvas
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      style={{
        top: 0,
        height: HEIGHT,
        width: WIDTH,
      }}
    />
  );
});

CanvasRecorder.displayName = "CanvasElement";

export default CanvasRecorder;
