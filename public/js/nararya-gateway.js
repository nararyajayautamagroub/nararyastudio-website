(function (global) {
  function loadScript(src, attributes) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(); }, { once: true });
        if (global.snap) resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      Object.keys(attributes || {}).forEach(function (key) {
        script.setAttribute(key, attributes[key]);
      });
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error("Gateway script gagal dimuat.")); };
      document.head.appendChild(script);
    });
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
