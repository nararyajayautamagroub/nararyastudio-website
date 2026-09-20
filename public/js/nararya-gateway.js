(function (global) {
  var pendingScripts = Object.create(null);

  function loadScript(src, attributes) {
    if (global.snap && typeof global.snap.pay === "function") return Promise.resolve();
    if (pendingScripts[src]) return pendingScripts[src];

    pendingScripts[src] = new Promise(function (resolve, reject) {
      var settled = false;
      var timer = null;
      var existing = document.querySelector('script[src="' + src + '"]');

      function finish(error) {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        delete pendingScripts[src];
        if (error) reject(error);
        else resolve();
      }

      function checkReady() {
        if (global.snap && typeof global.snap.pay === "function") finish();
      }

      if (existing) {
        checkReady();
        if (settled) return;
        existing.addEventListener("load", checkReady, { once: true });
        existing.addEventListener("error", function () {
          finish(new Error("Gateway script gagal dimuat."));
        }, { once: true });
        timer = setTimeout(function () {
          checkReady();
          if (!settled) finish(new Error("Gateway script timeout."));
        }, 10000);
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      Object.keys(attributes || {}).forEach(function (key) {
        script.setAttribute(key, attributes[key]);
      });
      script.onload = checkReady;
      script.onerror = function () {
        finish(new Error("Gateway script gagal dimuat."));
      };
      document.head.appendChild(script);
      timer = setTimeout(function () {
        checkReady();
        if (!settled) finish(new Error("Gateway script timeout."));
      }, 10000);
    });

    return pendingScripts[src];
  }

  async function startMidtrans(token, clientKey, production, callbacks) {
    if (!token || !clientKey) throw new Error("Data Midtrans tidak lengkap.");
    var src = production
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    await loadScript(src, { "data-client-key": clientKey });
    if (!global.snap || typeof global.snap.pay !== "function") {
      throw new Error("Midtrans Snap tidak tersedia.");
    }
    return new Promise(function (resolve) {
      global.snap.pay(token, {
        onSuccess: function (result) {
          if (callbacks && callbacks.onSuccess) callbacks.onSuccess(result);
          resolve({ status: "success", result: result });
        },
        onPending: function (result) {
          if (callbacks && callbacks.onPending) callbacks.onPending(result);
          resolve({ status: "pending", result: result });
        },
        onError: function (result) {
          if (callbacks && callbacks.onError) callbacks.onError(result);
          resolve({ status: "error", result: result });
        },
        onClose: function () {
          if (callbacks && callbacks.onClose) callbacks.onClose();
          resolve({ status: "closed" });
        }
      });
    });
  }

  global.NararyaGateway = {
    loadScript: loadScript,
    startMidtrans: startMidtrans
  };
}(window));
