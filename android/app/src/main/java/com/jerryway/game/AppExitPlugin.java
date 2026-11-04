package com.jerryway.game;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// botão "Sair do jogo": fecha o app de verdade (e tira da lista de recentes)
@CapacitorPlugin(name = "AppExit")
public class AppExitPlugin extends Plugin {
    @PluginMethod
    public void exit(PluginCall call) {
        call.resolve();
        getActivity().runOnUiThread(() -> getActivity().finishAndRemoveTask());
    }
}
