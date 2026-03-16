import { registerPlugin } from "@capacitor/core";

const TFLite = registerPlugin<any>("TFLite");

export async function runOfflineModel(base64: string) {

  // Detect if running in browser (npm run dev)
  if (!(window as any).Capacitor || (window as any).Capacitor.getPlatform() === "web") {

    console.log("Browser mode: using stub ML result");

    return {
      diseaseName: "Demo Plant (browser mode)",
      confidence: 82,
      status: "Healthy",
      description: "Browser testing mode. Real TensorFlow Lite runs only in Android.",
      growthStage: "Vegetative",
      growthStageDescription: "Leaf development stage",
      recommendations: [
        "Water regularly",
        "Provide sunlight",
        "Check soil moisture"
      ],
      imageUrl: `data:image/jpeg;base64,${base64}`,
      timestamp: Date.now()
    };

  }

  // Android → run real TFLite plugin
  try {

    const result = await TFLite.predict({
      image: base64
    });

    return {
      diseaseName: result.disease,
      confidence: Math.round(result.confidence * 100),
      status: result.confidence > 0.6 ? "Issue Detected" : "Healthy",
      description: "Prediction from TensorFlow Lite model.",
      growthStage: "Unknown",
      growthStageDescription: "Detected using offline model",
      recommendations: [
        "Ensure proper watering",
        "Provide adequate sunlight",
        "Check leaf condition"
      ],
      imageUrl: `data:image/jpeg;base64,${base64}`,
      timestamp: Date.now()
    };

  } catch (e) {

    console.error("TFLite error:", e);

    return {
      diseaseName: "Model error",
      confidence: 0,
      status: "Issue",
      description: "TensorFlow inference failed.",
      growthStage: "Unknown",
      growthStageDescription: "",
      recommendations: [],
      imageUrl: `data:image/jpeg;base64,${base64}`,
      timestamp: Date.now()
    };

  }

}