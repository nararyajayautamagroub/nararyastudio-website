# Scraper

NARARYA STUDIO menyediakan scraper CLI ringan berbasis Node.js tanpa dependency tambahan.

Penggunaan:

    npm run scrape -- https://example.com --out scrape-output.json

Crawler memakai mode same-origin secara default:

    npm run scrape -- https://example.com --max-pages 25

Untuk eksplisit same-origin:

    npm run scrape -- https://example.com --same-origin --max-pages 25

Untuk mengizinkan crawl lintas origin gunakan `--all-origins` hanya bila memang diperlukan:

Dengan delay dan timeout:

    npm run scrape -- https://example.com --same-origin --max-pages 50 --delay 500 --timeout 15000

Konfigurasi banyak sumber:

    {
      "sources": [
        "https://example.com",
        { "url": "https://example.org/news" }
      ]
    }

Lalu:

    npm run scrape -- --config scraper-config.json --out scrape-output.json

Scraper menghormati robots.txt secara default dan membatasi jumlah halaman, timeout, serta jeda antar halaman.

Data yang dikumpulkan dari HTML mencakup title, description, canonical, Open Graph, headings, JSON-LD, tautan dan teks yang sudah dibersihkan.

Gunakan hanya pada sumber yang memang boleh diakses dan sesuai Terms of Service serta robots policy situs tersebut. Scraper ini sengaja tidak mencoba melewati login, CAPTCHA, paywall, rate limit, atau kontrol akses.
