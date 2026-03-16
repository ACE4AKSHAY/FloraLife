import { registerPlugin } from "@capacitor/core";
import { getOfflineDiseaseProfile } from "./offlineDiseaseProfiles";

const TFLite = registerPlugin<any>("TFLite");

export async function runOfflineModel(base64: string) {

  // Detect if running in browser (npm run dev)
  if (!(window as any).Capacitor || (window as any).Capacitor.getPlatform() === "web") {

    console.log("Browser mode: using stub ML result");

    const demoProfile = getOfflineDiseaseProfile("pepper bell healthy");

    return {
      ...demoProfile,
      confidence: 82,
      description: "Browser testing mode. Real TensorFlow Lite runs only in Android, but the offline result layout is previewed here.",
      imageUrl: `data:image/jpeg;base64,${base64}`,
      timestamp: Date.now()
    };

  }

  // Android → run real TFLite plugin
  try {

    const result = await TFLite.predict({
      image: base64
    });

    const profile = getOfflineDiseaseProfile(result.disease);

    return {
      ...profile,
      confidence: Math.round(result.confidence * 100),
      imageUrl: `data:image/jpeg;base64,${base64}`,
      timestamp: Date.now()
    };

  } catch (e) {

    console.error("TFLite error:", e);

    return {
      ...getOfflineDiseaseProfile("background"),
      diseaseName: "Offline model error",
      confidence: 0,
      description: "TensorFlow inference failed.",
      imageUrl: `data:image/jpeg;base64,${base64}`,
      timestamp: Date.now()
    };

  }

}
