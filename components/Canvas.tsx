import * as React from "react";

const WIDTH = 600;
const HEIGHT = 400;

const Canvas = React.forwardRef<HTMLCanvasElement, {}>((_, ref) => {
  return (
    <canvas
      style={{
        position: "absolute",
        top: -99_999,
        left: -99_999,
        height: HEIGHT / 2,
        width: WIDTH / 2,
      }}
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
    />
  );
});

Canvas.displayName = "CanvasElement";

export default Canvas;
