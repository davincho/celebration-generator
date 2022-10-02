import type { NextPage } from "next";

import { Player } from "@remotion/player";

import { MyComposition } from "./Video";

const Home: NextPage = () => {
  return (
    <>
      <Player
        component={MyComposition}
        durationInFrames={120}
        compositionWidth={600}
        compositionHeight={400}
        fps={30}
      />
      <button
        onClick={() => {
          fetch("/api/hello");
        }}
      >
        Save video
      </button>
    </>
  );
};

export default Home;
