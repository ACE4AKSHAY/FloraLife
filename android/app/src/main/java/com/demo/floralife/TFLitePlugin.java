package com.demo.floralife;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

import org.tensorflow.lite.DataType;
import org.tensorflow.lite.Interpreter;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@CapacitorPlugin(name = "TFLite")
public class TFLitePlugin extends Plugin {

    private static final String TAG = "TFLitePlugin";

    private Interpreter interpreter;
    private List<String> labels = new ArrayList<>();

    private static final class PredictionResult {
        final int index;
        final float score;
        final String mode;

        PredictionResult(int index, float score, String mode) {
            this.index = index;
            this.score = score;
            this.mode = mode;
        }
    }

    @Override
    public void load() {
        try {
            Log.i(TAG, "Loading TensorFlow Lite model and labels");

            InputStream is = getContext().getAssets().open("model.tflite");
            byte[] model = new byte[is.available()];
            is.read(model);
            is.close();

            ByteBuffer modelBuffer = ByteBuffer.allocateDirect(model.length);
            modelBuffer.order(ByteOrder.nativeOrder());
            modelBuffer.put(model);
            modelBuffer.rewind();

            interpreter = new Interpreter(modelBuffer);
            Log.i(
                    TAG,
                    "Model input tensor: "
                            + Arrays.toString(interpreter.getInputTensor(0).shape())
                            + " "
                            + interpreter.getInputTensor(0).dataType()
            );
            Log.i(
                    TAG,
                    "Model output tensor: "
                            + Arrays.toString(interpreter.getOutputTensor(0).shape())
                            + " "
                            + interpreter.getOutputTensor(0).dataType()
            );

            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(
                                    getContext().getAssets().open("labels.txt")
                            )
                    );

            String line;

            while ((line = reader.readLine()) != null) {
                labels.add(line);
            }

            reader.close();
            Log.i(TAG, "TFLite plugin ready with " + labels.size() + " labels");
        } catch (Exception e) {
            Log.e(TAG, "Failed to load TensorFlow Lite assets", e);
        }
    }
    
    @PluginMethod
    public void predict(PluginCall call) {
        try {
            if (interpreter == null) {
                call.reject("TFLite interpreter is not initialized");
                return;
            }

            String base64 = call.getString("image");
            if (base64 == null || base64.isEmpty()) {
                call.reject("Missing image payload");
                return;
            }

            Log.i(TAG, "Received image for offline prediction");

            byte[] decoded = Base64.decode(base64, Base64.DEFAULT);
            Bitmap bitmap =
                    BitmapFactory.decodeByteArray(decoded, 0, decoded.length);

            if (bitmap == null) {
                call.reject("Unable to decode image");
                return;
            }

            PredictionResult prediction = runPrediction(bitmap);
            String disease = labels.get(prediction.index);
            Log.i(TAG, "Prediction complete (" + prediction.mode + "): " + disease + " (" + prediction.score + ")");

            JSObject ret = new JSObject();

            ret.put("disease", disease);
            ret.put("confidence", prediction.score);

            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Offline prediction failed", e);
            call.reject(e.getMessage());
        }
    }

    private PredictionResult runPrediction(Bitmap bitmap) {
        DataType inputType = interpreter.getInputTensor(0).dataType();

        if (inputType == DataType.FLOAT32) {
            PredictionResult rawPrediction = runFloatPrediction(bitmap, false, "float-raw255");
            PredictionResult normalizedPrediction = runFloatPrediction(bitmap, true, "float-normalized");
            PredictionResult bestPrediction = chooseBestPrediction(rawPrediction, normalizedPrediction);

            Log.i(
                    TAG,
                    "Float preprocessing comparison -> raw: "
                            + labels.get(rawPrediction.index)
                            + " ("
                            + rawPrediction.score
                            + "), normalized: "
                            + labels.get(normalizedPrediction.index)
                            + " ("
                            + normalizedPrediction.score
                            + "), selected: "
                            + labels.get(bestPrediction.index)
                            + " ("
                            + bestPrediction.mode
                            + ")"
            );

            return bestPrediction;
        }

        Object input = createQuantizedInput(bitmap);
        float[][] output = new float[1][labels.size()];
        interpreter.run(input, output);
        return findBestPrediction(output[0], "quantized");
    }

    private PredictionResult runFloatPrediction(Bitmap bitmap, boolean normalize, String mode) {
        ByteBuffer input = createFloatInput(bitmap, normalize);
        float[][] output = new float[1][labels.size()];
        interpreter.run(input, output);
        return findBestPrediction(output[0], mode);
    }

    private PredictionResult chooseBestPrediction(PredictionResult first, PredictionResult second) {
        String firstLabel = labels.get(first.index);
        String secondLabel = labels.get(second.index);
        boolean firstBackground = "background".equals(firstLabel);
        boolean secondBackground = "background".equals(secondLabel);

        if (firstBackground != secondBackground) {
            PredictionResult nonBackground = firstBackground ? second : first;
            PredictionResult background = firstBackground ? first : second;

            if (nonBackground.score >= background.score * 0.85f) {
                return nonBackground;
            }
        }

        return first.score >= second.score ? first : second;
    }

    private PredictionResult findBestPrediction(float[] scores, String mode) {
        int index = 0;
        float max = Float.NEGATIVE_INFINITY;

        for (int i = 0; i < scores.length; i++) {
            if (scores[i] > max) {
                max = scores[i];
                index = i;
            }
        }

        return new PredictionResult(index, max, mode);
    }

    private ByteBuffer createFloatInput(Bitmap bitmap, boolean normalize) {
        int[] inputShape = interpreter.getInputTensor(0).shape();
        int height = inputShape[1];
        int width = inputShape[2];
        Bitmap resized = Bitmap.createScaledBitmap(bitmap, width, height, true);
        ByteBuffer input = ByteBuffer.allocateDirect(4 * height * width * 3);
        input.order(ByteOrder.nativeOrder());

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = resized.getPixel(x, y);
                float red = ((pixel >> 16) & 0xFF);
                float green = ((pixel >> 8) & 0xFF);
                float blue = (pixel & 0xFF);

                if (normalize) {
                    red /= 255.0f;
                    green /= 255.0f;
                    blue /= 255.0f;
                }

                input.putFloat(red);
                input.putFloat(green);
                input.putFloat(blue);
            }
        }

        input.rewind();
        return input;
    }

    private Object createQuantizedInput(Bitmap bitmap) {
        int[] inputShape = interpreter.getInputTensor(0).shape();
        int height = inputShape[1];
        int width = inputShape[2];
        Bitmap resized = Bitmap.createScaledBitmap(bitmap, width, height, true);
        byte[][][][] input = new byte[1][height][width][3];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = resized.getPixel(x, y);

                input[0][y][x][0] = (byte) ((pixel >> 16) & 0xFF);
                input[0][y][x][1] = (byte) ((pixel >> 8) & 0xFF);
                input[0][y][x][2] = (byte) (pixel & 0xFF);
            }
        }

        return input;
    }

}
