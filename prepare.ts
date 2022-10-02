import path from "path";
import { bundle } from "@remotion/bundler";


const prepare = async () => {




    // You only have to do this once, you can reuse the bundle.
    const entry = "./components/remotion-index.tsx";
    console.log("Creating a Webpack bundle of the video", path.resolve(entry));

    const bundleLocation = await bundle({
        entryPoint: path.resolve(entry),
        onProgress(progress) {
            // console.log('Progress: ' + progress)
        },
        publicDir: 'not-existent',
        outDir: process.cwd() + '/public/video'
    });




    console.log('Done with bundle here: ', bundleLocation)


}

prepare()
