(function () {
  try {
    var locale = localStorage.getItem("ns_locale") || "id";
    var theme = localStorage.getItem("ns_theme") || "system";
    if (!["id","en","ms","zh","ja","ko","ar","hi","es","fr"].includes(locale)) locale = "id";
    if (!["system","light","dark"].includes(theme)) theme = "system";
    var dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", dark);
  } catch (error) {
    // React provider remains the source of truth when storage is unavailable.
  }
}());
