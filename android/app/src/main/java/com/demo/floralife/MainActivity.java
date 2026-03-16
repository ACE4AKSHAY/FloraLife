package com.demo.floralife;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void load() {
        registerPlugin(TFLitePlugin.class);
        super.load();
    }
}
