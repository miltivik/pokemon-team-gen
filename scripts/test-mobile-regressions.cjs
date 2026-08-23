/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression runner. */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const checks = [
    ["VGC CTA is full width on mobile", "app/(site)/guides/vgc/vgc-guide-client.tsx", "w-full min-w-0"],
    ["VGC CTA shrinks on desktop", "app/(site)/guides/vgc/vgc-guide-client.tsx", "sm:w-auto"],
    ["VGC CTA overrides nowrap", "app/(site)/guides/vgc/vgc-guide-client.tsx", "whitespace-normal"],
    ["VGC CTA meets touch target", "app/(site)/guides/vgc/vgc-guide-client.tsx", "min-h-11"],
    ["shell reserves mobile navigation space", "components/SiteShell.tsx", "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0"],
    ["mobile menu exposes expanded state", "components/Navbar.tsx", "aria-expanded={mobileMenuOpen}"],
    ["mobile menu has a controlled menu id", "components/Navbar.tsx", "aria-controls=\"mobile-guides-menu\""],
    ["Spanish mobile menu label is translated", "components/Navbar.tsx", "aria-label={lang === \"es\" ? \"Menú\" : \"Menu\"}"],
    ["consent uses dialog semantics", "components/CookieConsent.tsx", "<DialogContent"],
    ["consent marks modal content", "components/CookieConsent.tsx", "aria-modal=\"true\""],
    ["consent dialog includes a title", "components/CookieConsent.tsx", "<DialogTitle"],
    ["consent has Spanish copy", "lib/consent.ts", "Valoramos tu privacidad"],
    ["footer keeps Spanish accents", "components/Footer.tsx", "Política de privacidad"],
    ["fixed Pokemon input is labelable", "components/PokemonCombobox.tsx", "id?: string"],
    ["TeamForm passes fixed Pokemon input id", "components/TeamForm.tsx", "id=\"pokemon\""],
];

let failures = 0;
for (const [name, file, needle] of checks) {
    if (!read(file).includes(needle)) {
        failures += 1;
        console.error(`FAIL ${name}: missing ${needle} in ${file}`);
    }
}

if (failures > 0) {
    console.error(`\n${failures}/${checks.length} mobile regression checks failed.`);
    process.exitCode = 1;
} else {
    console.log(`PASS mobile regressions (${checks.length}/${checks.length})`);
}
