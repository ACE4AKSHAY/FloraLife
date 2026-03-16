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

            Bitmap resized =
                    Bitmap.createScaledBitmap(bitmap, 224, 224, true);

            Object input = createModelInput(resized);

            float[][] output = new float[1][labels.size()];

            interpreter.run(input, output);

            int index = 0;
            float max = 0;

            for (int i = 0; i < output[0].length; i++) {
                if (output[0][i] > max) {
                    max = output[0][i];
                    index = i;
                }
            }

            String disease = labels.get(index);
            Log.i(TAG, "Prediction complete: " + disease + " (" + max + ")");

            JSObject ret = new JSObject();

            ret.put("disease", disease);
            ret.put("confidence", max);

            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Offline prediction failed", e);
            call.reject(e.getMessage());
        }
    }

    private Object createModelInput(Bitmap bitmap) {
        int[] inputShape = interpreter.getInputTensor(0).shape();
        DataType inputType = interpreter.getInputTensor(0).dataType();
        int height = inputShape[1];
        int width = inputShape[2];

        if (inputType == DataType.FLOAT32) {
            float[][][][] input = new float[1][height][width][3];

            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                    int pixel = bitmap.getPixel(x, y);

                    input[0][y][x][0] = ((pixel >> 16) & 0xFF) / 255.0f;
                    input[0][y][x][1] = ((pixel >> 8) & 0xFF) / 255.0f;
                    input[0][y][x][2] = (pixel & 0xFF) / 255.0f;
                }
            }

            return input;
        }

        byte[][][][] input = new byte[1][height][width][3];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = bitmap.getPixel(x, y);

                input[0][y][x][0] = (byte) ((pixel >> 16) & 0xFF);
                input[0][y][x][1] = (byte) ((pixel >> 8) & 0xFF);
                input[0][y][x][2] = (byte) (pixel & 0xFF);
            }
        }

        return input;
    }

}
