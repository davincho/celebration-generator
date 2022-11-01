import * as React from "react";

import { HEIGHT, WIDTH } from "./const";

const Canvas = React.forwardRef<HTMLCanvasElement>((_, ref) => {
  return (
    <canvas
      style={{
        position: "absolute",
        top: -1000,
        left: -1000,
        height: HEIGHT,
        width: WIDTH,
      }}
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
    />
  );
});

Canvas.displayName = "CanvasElement";

export default Canvas;
