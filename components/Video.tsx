import {
  useCurrentFrame,
  AbsoluteFill,
  useVideoConfig,
  Composition,
} from "remotion";

// import JSConfetti from "js-confetti";
// import * as React from "react";

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  console.log("frame", frame);

  // React.useEffect(() => {
  //   const jsConfetti = new JSConfetti();

  //   jsConfetti.addConfetti();
  // }, []);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        color: "red",
        fontSize: 100,
        backgroundColor: "white",
      }}
    >
      Currently: {frame}
    </AbsoluteFill>
  );
};

export const MyVideo = () => {
  return (
    <Composition
      id="MyComposition"
      durationInFrames={30}
      fps={30}
      width={600}
      height={400}
      component={MyComposition}
    />
  );
};

export default MyVideo;
