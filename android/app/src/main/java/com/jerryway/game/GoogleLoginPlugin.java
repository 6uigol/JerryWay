package com.jerryway.game;

import android.content.Intent;
import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/** OAuth inteiro no navegador do sistema. A WebView recebe somente o resultado autenticável. */
@CapacitorPlugin(name = "GoogleLogin")
public class GoogleLoginPlugin extends Plugin {
    private static final Handler main = new Handler(Looper.getMainLooper());
    private static volatile LoginSession current;
    private static Context app;

    @Override public void load() { app = getContext().getApplicationContext(); }

    @PluginMethod
    public void begin(PluginCall call) {
        JSObject config = call.getObject("config");
        if (config == null || !config.has("apiKey") || !config.has("projectId")) {
            call.reject("Login com o Google não está configurado.");
            return;
        }
        synchronized (GoogleLoginPlugin.class) {
            if (current != null) {
                call.resolve(new JSObject().put("state", current.state).put("status", "pending"));
                return;
            }
            try {
                JSObject saved = readResult();
                if ("complete".equals(saved.optString("status"))) { call.resolve(saved); return; }
                current = new LoginSession(config);
                writeResult(new JSObject().put("state", current.state).put("status", "pending"));
            } catch (Exception error) { current = null; call.reject("Não foi possível guardar o acesso com segurança. Tente novamente."); return; }
        }
        LoginSession session = current;
        new Thread(() -> {
            try {
                session.server = new ServerSocket(0, 8, InetAddress.getByName("127.0.0.1"));
                session.origin = "http://localhost:" + session.server.getLocalPort();
                call.resolve(new JSObject().put("state", session.state).put("status", "pending"));
                main.post(() -> {
                    if (current != session) { session.close(); return; }
                    main.postDelayed(session.timeout, 300000);
                    try {
                        Intent browser = new Intent(Intent.ACTION_VIEW, Uri.parse(session.origin + "/?s=" + session.state));
                        browser.addCategory(Intent.CATEGORY_BROWSABLE);
                        browser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        app.startActivity(browser);
                    } catch (Exception error) {
                        finish(session, null, "Não foi possível abrir o navegador. Confira se há um navegador instalado.");
                    }
                });
                while (current == session && !session.server.isClosed()) {
                    Socket socket = session.server.accept();
                    socket.setSoTimeout(10000);
                    session.clients.execute(() -> serve(session, socket));
                }
            } catch (Exception error) {
                if (current == session) { finish(session, null, "Não foi possível preparar o login. Tente novamente."); call.reject("Não foi possível preparar o login. Tente novamente."); }
            }
        }, "SongGoogleLogin").start();
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        LoginSession session = current;
        if (session != null) finish(session, null, "Login cancelado. Toque no Google para tentar novamente.");
        call.resolve();
    }

    // A resposta é lida por uma nova chamada quando a WebView volta ao primeiro plano.
    // Nenhuma credencial depende de um callback JavaScript mantido durante o OAuth.
    @PluginMethod
    public void getResult(PluginCall call) {
        try {
            JSObject result = readResult();
            if ("pending".equals(result.optString("status")) && current == null) {
                result.put("status", "error").put("error", "O Android interrompeu o login. Toque no Google para tentar novamente.");
            }
            call.resolve(result);
        } catch (Exception error) { call.reject("Não foi possível recuperar o acesso. Tente novamente."); }
    }

    @PluginMethod
    public void acknowledge(PluginCall call) {
        synchronized (GoogleLoginPlugin.class) {
            try {
                JSObject result = readResult();
                if (result.optString("state").equals(call.getString("state"))) resultFile().delete();
                call.resolve();
            } catch (Exception error) { call.reject("Não foi possível finalizar o acesso."); }
        }
    }

    private static boolean finish(LoginSession session, JSObject result, String error) {
        synchronized (GoogleLoginPlugin.class) {
            if (current != session) return false;
            try {
                JSObject saved = result == null ? new JSObject() : result;
                saved.put("state", session.state).put("status", result == null ? "error" : "complete");
                if (error != null) saved.put("error", error);
                writeResult(saved); // Persiste ANTES de devolver o usuário ao aplicativo.
            } catch (Exception failure) {
                session.completed = false;
                return false; // O navegador pode repetir; nunca confirmar algo que não foi guardado.
            }
            current = null;
            main.removeCallbacks(session.timeout);
            session.close();
        }
        if (result != null) main.post(() -> {
            try {
                Intent back = app.getPackageManager().getLaunchIntentForPackage(app.getPackageName());
                if (back != null) {
                    back.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    app.startActivity(back);
                }
            } catch (Exception ignored) { /* O navegador também oferece Voltar ao jogo. */ }
        });
        return true;
    }

    private static File resultFile() { return new File(app.getNoBackupFilesDir(), "google-login-result"); }
    private static SecretKey resultKey() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        String alias = "song-google-return-v1";
        if (!store.containsAlias(alias)) {
            KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            generator.init(new KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
            generator.generateKey();
        }
        return (SecretKey) store.getKey(alias, null);
    }
    private static synchronized void writeResult(JSObject data) throws Exception {
        data.put("expires", System.currentTimeMillis() + 300000);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, resultKey());
        JSONObject box = new JSONObject();
        box.put("iv", Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP));
        box.put("data", Base64.encodeToString(cipher.doFinal(data.toString().getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP));
        File temporary = new File(app.getNoBackupFilesDir(), "google-login-result.tmp");
        try (FileOutputStream output = new FileOutputStream(temporary)) {
            output.write(box.toString().getBytes(StandardCharsets.UTF_8)); output.getFD().sync();
        }
        if (!temporary.renameTo(resultFile())) throw new Exception("Falha ao guardar retorno");
    }
    private static synchronized JSObject readResult() throws Exception {
        File file = resultFile();
        if (!file.exists()) return new JSObject().put("status", "idle");
        try {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            try (FileInputStream input = new FileInputStream(file)) {
                byte[] buffer = new byte[4096];
                for (int n; (n = input.read(buffer)) != -1;) bytes.write(buffer, 0, n);
            }
            JSONObject box = new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, resultKey(), new GCMParameterSpec(128, Base64.decode(box.getString("iv"), Base64.NO_WRAP)));
            JSObject result = new JSObject(new String(cipher.doFinal(Base64.decode(box.getString("data"), Base64.NO_WRAP)), StandardCharsets.UTF_8));
            if (result.optLong("expires") > System.currentTimeMillis()) return result;
        } catch (Exception error) { file.delete(); throw error; }
        file.delete(); return new JSObject().put("status", "idle");
    }

    private static void serve(LoginSession session, Socket socket) {
        try (Socket client = socket) {
            InputStream input = new BufferedInputStream(client.getInputStream());
            String request = line(input);
            if (request == null) return;
            String[] parts = request.split(" ", 3);
            if (parts.length < 2) { respond(client, 400, "text/plain", "Requisição inválida".getBytes(StandardCharsets.UTF_8)); return; }
            Map<String, String> headers = new HashMap<>();
            int headerSize = request.length();
            for (String value; (value = line(input)) != null && !value.isEmpty();) {
                headerSize += value.length();
                if (headerSize > 16384) return;
                int colon = value.indexOf(':');
                if (colon > 0) headers.put(value.substring(0, colon).toLowerCase(Locale.ROOT), value.substring(colon + 1).trim());
            }
            if (current != session || !("localhost:" + session.server.getLocalPort()).equals(headers.get("host"))) {
                respond(client, 403, "text/plain", new byte[0]); return;
            }
            Uri uri = Uri.parse(parts[1]);
            String path = uri.getPath();
            if ("GET".equals(parts[0]) && "/".equals(path) && sameState(session, uri.getQueryParameter("s"))) {
                asset(client, "public/src/google-browser.html", "text/html; charset=utf-8"); return;
            }
            if ("GET".equals(parts[0]) && "/session".equals(path) && sameState(session, uri.getQueryParameter("s"))) {
                JSONObject data = new JSONObject();
                data.put("config", session.config);
                data.put("returnUrl", "intent://auth/complete#Intent;scheme=jerryway;package=" + app.getPackageName() + ";end");
                respond(client, 200, "application/json", data.toString().getBytes(StandardCharsets.UTF_8)); return;
            }
            if ("GET".equals(parts[0])) {
                if ("/src/google-browser.js".equals(path)) { asset(client, "public/src/google-browser.js", "text/javascript; charset=utf-8"); return; }
                if ("/vendor/cloud.bundle.js".equals(path)) { asset(client, "public/vendor/cloud.bundle.js", "text/javascript; charset=utf-8"); return; }
                if ("/icons/icon-32.png".equals(path)) { asset(client, "public/icons/icon-32.png", "image/png"); return; }
            }
            if ("POST".equals(parts[0]) && "/done".equals(path)) {
                if (!session.origin.equals(headers.get("origin")) || !headers.getOrDefault("content-type", "").startsWith("application/json")) {
                    respond(client, 403, "text/plain", new byte[0]); return;
                }
                int length = Integer.parseInt(headers.getOrDefault("content-length", "-1"));
                if (length < 1 || length > 20000) { respond(client, 400, "text/plain", new byte[0]); return; }
                byte[] bytes = new byte[length];
                int count = 0;
                while (count < length) { int n = input.read(bytes, count, length - count); if (n < 0) return; count += n; }
                JSONObject data = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
                Object token = data.opt("idToken");
                Object access = data.opt("accessToken");
                boolean hasId = token instanceof String && !((String) token).isEmpty();
                boolean hasAccess = access instanceof String && !((String) access).isEmpty();
                if (!sameState(session, data.optString("state", null)) || (!hasId && !hasAccess)) {
                    respond(client, 400, "text/plain", new byte[0]); return;
                }
                synchronized (session) {
                    if (session.completed) { respond(client, 409, "text/plain", new byte[0]); return; }
                    session.completed = true;
                }
                JSObject tokens = new JSObject();
                if (hasId) tokens.put("idToken", (String) token);
                if (hasAccess) tokens.put("accessToken", (String) access);
                if (!finish(session, tokens, null)) { respond(client, 503, "text/plain", new byte[0]); return; }
                respond(client, 200, "application/json", "{\"ok\":true}".getBytes(StandardCharsets.UTF_8)); return;
            }
            respond(client, 404, "text/plain", new byte[0]);
        } catch (Exception ignored) { /* Requisições inválidas não encerram a tentativa de login. */ }
    }

    private static boolean sameState(LoginSession session, String value) {
        return value != null && MessageDigest.isEqual(session.state.getBytes(StandardCharsets.US_ASCII), value.getBytes(StandardCharsets.UTF_8));
    }

    private static String line(InputStream input) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        for (int c; (c = input.read()) != -1;) {
            if (c == '\n') break;
            if (c != '\r') bytes.write(c);
            if (bytes.size() > 8192) throw new Exception("Cabeçalho muito grande");
        }
        return bytes.size() == 0 ? "" : bytes.toString(StandardCharsets.US_ASCII.name());
    }

    private static void asset(Socket socket, String name, String type) throws Exception {
        try (InputStream input = app.getAssets().open(name); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            for (int n; (n = input.read(buffer)) != -1;) output.write(buffer, 0, n);
            respond(socket, 200, type, output.toByteArray());
        }
    }

    private static void respond(Socket socket, int status, String type, byte[] body) throws Exception {
        OutputStream output = socket.getOutputStream();
        String header = "HTTP/1.1 " + status + " " + (status == 200 ? "OK" : "Error") + "\r\nContent-Type: " + type
            + "\r\nContent-Length: " + body.length + "\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n";
        output.write(header.getBytes(StandardCharsets.US_ASCII)); output.write(body); output.flush();
    }

    private static final class LoginSession {
        final JSObject config;
        final String state;
        final ExecutorService clients = Executors.newFixedThreadPool(4);
        final Runnable timeout;
        volatile ServerSocket server;
        volatile String origin;
        volatile boolean completed;
        LoginSession(JSObject config) {
            this.config = config;
            byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
            StringBuilder value = new StringBuilder();
            for (byte b : bytes) value.append(String.format(Locale.ROOT, "%02x", b & 255));
            state = value.toString();
            timeout = () -> finish(this, null, "O tempo do login acabou. Toque no Google para tentar novamente.");
        }
        void close() {
            try { if (server != null) server.close(); } catch (Exception ignored) {}
            clients.shutdown();
        }
    }
}
