import fs from "fs";
import path from "path";

const srcFamily = "C:\\Users\\aryas\\.gemini\\antigravity-ide\\brain\\ef0935e4-7843-4a16-afea-2dae4828f62e\\about_family_discussion_1787869279500.jpg";
const srcConversation = "C:\\Users\\aryas\\.gemini\\antigravity-ide\\brain\\ef0935e4-7843-4a16-afea-2dae4828f62e\\about_family_conversation_1787869317173.jpg";
const destDir = path.resolve("./public/images");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcFamily)) {
  fs.copyFileSync(srcFamily, path.join(destDir, "about-family.jpg"));
  console.log("about-family.jpg copied successfully!");
}

if (fs.existsSync(srcConversation)) {
  fs.copyFileSync(srcConversation, path.join(destDir, "about-conversation.jpg"));
  console.log("about-conversation.jpg copied successfully!");
}
