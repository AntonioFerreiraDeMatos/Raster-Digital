// Gera versões otimizadas (WebP/PNG) das imagens do site.
// Uso: node scripts/optimize-images.mjs <foto-fundador> <amanda-desktop> <amanda-mobile>
import sharp from "sharp";
const [founder, amandaDesk, amandaMob] = process.argv.slice(2);
const out = "public/img";
await sharp("public/logo.png").resize({ width: 360 }).png({ compressionLevel: 9, palette: true }).toFile(`${out}/logo.png`);
await sharp("public/logo.png").resize({ width: 360 }).webp({ quality: 85 }).toFile(`${out}/logo.webp`);
await sharp("public/logo.png").resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`public/favicon-64.png`);
await sharp("public/logo.png").resize(180, 180, { fit: "contain", background: "#020713" }).png().toFile(`public/apple-touch-icon.png`);
if (founder) {
  await sharp(founder).resize({ width: 720 }).webp({ quality: 82 }).toFile(`${out}/antonio-matos.webp`);
  await sharp(founder).resize({ width: 720 }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${out}/antonio-matos.jpg`);
}
if (amandaDesk) {
  await sharp(amandaDesk).resize({ width: 1280 }).webp({ quality: 80 }).toFile(`${out}/amanda-desktop.webp`);
  // Imagem de compartilhamento (Open Graph) 1200x630
  await sharp(amandaDesk).resize(1200, 630, { fit: "cover", position: "left" }).jpeg({ quality: 80 }).toFile(`${out}/og-amanda.jpg`);
}
if (amandaMob) await sharp(amandaMob).resize({ width: 390 }).webp({ quality: 80 }).toFile(`${out}/amanda-mobile.webp`);
await sharp("public/jsretifica.jpg").resize({ width: 1000 }).webp({ quality: 78 }).toFile(`${out}/jsretifica.webp`);
console.log("ok");
