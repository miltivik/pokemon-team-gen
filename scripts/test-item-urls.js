const https = require('https');

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            const status = res.statusCode;
            const label = status === 200 ? 'OK' : (status >= 300 && status < 400 ? 'REDIRECT' : 'FAIL');
            const short = url.replace('https://raw.githubusercontent.com/msikma/pokesprite/master/items/', '');
            console.log(`[${label} ${status}] ${short}`);
            resolve(status === 200);
        }).on('error', (e) => {
            console.error(`[ERROR] ${url} (${e.message})`);
            resolve(false);
        });
    });
}

async function run() {
    const base = "https://raw.githubusercontent.com/msikma/pokesprite/master/items";
    const categories = ["hold-item", "other-item", "battle-item", "medicine", "berry"];
    const items = ["heavy-duty-boots", "booster-energy", "leftovers", "choice-band", "assault-vest", "covert-cloak"];

    for (const item of items) {
        for (const cat of categories) {
            const ok = await checkUrl(`${base}/${cat}/${item}.png`);
            if (ok) break;
        }
    }
}

run();
