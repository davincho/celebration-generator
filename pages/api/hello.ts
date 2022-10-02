// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

import path from "path";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";

const start = async () => {
  // The composition you want to render
  const compositionId = "MyComposition";

  // You only have to do this once, you can reuse the bundle.
  const entry = "./pages/Video";
  console.log("Creating a Webpack bundle of the video", path.resolve(entry));
  const bundleLocation = await bundle(path.resolve(entry), (perc) => {
    console.log('Progress: ' + perc)
  });

  // Parametrize the video by passing arbitrary props to your component.
  const inputProps = {
    foo: "bar",
  };

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    inputProps,
  });

  console.log(comps)

  // Select the composition you want to render.
  const composition = comps.find((c) => c.id === compositionId);

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
  }

  const outputLocation = `out/${compositionId}.mp4`;
  console.log("Attempting to render:", outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
  });
  console.log("Render done!");
};



export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {


  start().then((r) => {
    console.log('RESLLLLT', r)
    res.status(200).json({ name: 'John Doe' })
  })


}
