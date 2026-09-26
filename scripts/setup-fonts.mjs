// Prepara a fonte Chillax, cuja licença (ITF FFL) permite self-hosting para uso próprio
// mas proíbe redistribuição: o arquivo nunca entra no repositório.
// Origem: CHILLAX_WOFF2_URL (deploy do SaaS) ou CHILLAX_WOFF2_PATH (arquivo local, baixado do Fontshare).
// Sem nenhuma das duas, gera um CSS vazio e a aplicação usa só a Outfit.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const FILE = "Chillax-Variable.woff2";
const target = join("public", "fonts", "chillax", FILE);
const cssOut = join("src", "app", "fonts.generated.css");

try {
  process.loadEnvFile();
} catch {
  // Sem .env.
}

async function obtain() {
  if (existsSync(target)) return "já presente";
  mkdirSync(dirname(target), { recursive: true });

  const url = process.env.CHILLAX_WOFF2_URL;
  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao baixar a Chillax (${res.status}).`);
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    return "baixada de CHILLAX_WOFF2_URL";
  }

  const local = process.env.CHILLAX_WOFF2_PATH;
  if (local) {
    if (!existsSync(local)) throw new Error(`CHILLAX_WOFF2_PATH não encontrado: ${local}`);
    copyFileSync(local, target);
    return `copiada de ${local}`;
  }
  return null;
}

const source = await obtain();
const css = source
  ? `/* Gerado por scripts/setup-fonts.mjs. Não commitar. */
@font-face {
  font-family: "Chillax";
  src: url("/fonts/chillax/${FILE}") format("woff2");
  font-weight: 200 700;
  font-style: normal;
  font-display: swap;
}
`
  : `/* Gerado por scripts/setup-fonts.mjs. Chillax indisponível: usando só a Outfit. */\n`;
writeFileSync(cssOut, css);
console.log(source ? `Fonte Chillax ${source}.` : "Chillax não encontrada, usando Outfit.");
