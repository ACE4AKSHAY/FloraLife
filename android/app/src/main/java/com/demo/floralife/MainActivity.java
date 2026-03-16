package com.demo.floralife;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void load() {
        registerPlugin(TFLitePlugin.class);
        super.load();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (getBridge() != null) {
            getBridge().triggerJSEvent("backbutton", "document");
            return;
        }

        super.onBackPressed();
    }
}
