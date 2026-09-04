import fs from "fs";
import path from "path";

const srcHero = "C:\\Users\\aryas\\.gemini\\antigravity-ide\\brain\\ef0935e4-7843-4a16-afea-2dae4828f62e\\hero_reference_couple_1787865351171.jpg";
const destDir = path.resolve("./public/images");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcHero)) {
  fs.copyFileSync(srcHero, path.join(destDir, "hero-couple.jpg"));
  console.log("Hero image copied successfully!");
} else {
  console.log("Source image not found:", srcHero);
}
