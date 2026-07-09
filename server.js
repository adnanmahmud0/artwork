require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Express setup ───────────────────────────────────────────────────────────
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
});

// Serve static files (HTML, CSS, JS, images) from the project root
app.use(express.static(path.join(__dirname)));

// ── Prompts ─────────────────────────────────────────────────────────────────
const MULTI_IMAGE_PROMPT = `You are given up to 5 reference photos provided by a user. Learn from the style, colors, subjects, and themes in these reference photos, and generate a completely new, original artwork based on them. Expand the scene into a large, expansive canvas filled with many new objects, characters, and intricate details that fit the original theme. Do not just clean up the input; create a bustling, rich, and imaginative piece of art inspired by the input. The output should be a single, stunning gallery-ready image.`;

const SINGLE_IMAGE_PROMPT = `You are given a reference photo provided by a user. Learn from the style, colors, subjects, and themes in this reference photo, and generate a completely new, original artwork based on it. Expand the scene into a large, expansive canvas filled with many new objects, characters, and intricate details that fit the original theme. Do not just clean up the input; create a bustling, rich, and imaginative piece of art inspired by the input. The output should be a single, stunning gallery-ready image.`;

// ── POST /api/enhance ───────────────────────────────────────────────────────
// Accepts multipart form with field "images" (up to 5 files).
// Returns JSON: { success: true, image: "<base64 png>" }
app.post("/api/enhance", upload.array("images", 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: "No images provided." });
    }

    console.log(`[enhance] Received ${files.length} image(s), sending to OpenAI…`);

    // Build multipart/form-data for OpenAI
    const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
    const parts = [];

    // model
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\ngpt-image-1`
    );

    // images — use "image[]" field name for multiple inputs
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = (f.originalname.split(".").pop() || "png").toLowerCase();
      const mime = f.mimetype || `image/${ext === "jpg" ? "jpeg" : ext}`;
      parts.push(
        `--${boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="${f.originalname}"\r\nContent-Type: ${mime}\r\n\r\n`
      );
      // Binary part handled separately below
    }

    // prompt
    const prompt = files.length > 1 ? MULTI_IMAGE_PROMPT : SINGLE_IMAGE_PROMPT;
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="prompt"\r\n\r\n${prompt}`
    );

    // n = 1
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="n"\r\n\r\n1`
    );

    // size
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\n1024x1024`
    );

    // Assemble the full body as a Buffer so binary image data is preserved
    const bufferParts = [];
    let fileIdx = 0;
    for (const part of parts) {
      bufferParts.push(Buffer.from(part, "utf-8"));
      // After each image[] header, inject the binary data
      if (part.includes('name="image[]"')) {
        bufferParts.push(files[fileIdx].buffer);
        bufferParts.push(Buffer.from("\r\n", "utf-8"));
        fileIdx++;
      } else {
        bufferParts.push(Buffer.from("\r\n", "utf-8"));
      }
    }
    bufferParts.push(Buffer.from(`--${boundary}--\r\n`, "utf-8"));

    const body = Buffer.concat(bufferParts);

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("[enhance] OpenAI error:", JSON.stringify(data));
      return res.status(openaiRes.status).json({
        success: false,
        error: data.error?.message || "OpenAI API error",
        details: data,
      });
    }

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      // If the response contains a URL instead
      const url = data.data?.[0]?.url;
      if (url) {
        console.log("[enhance] Got URL result, fetching image…");
        const imgRes = await fetch(url);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        return res.json({
          success: true,
          image: imgBuf.toString("base64"),
        });
      }
      return res.status(500).json({
        success: false,
        error: "No image data in response",
        details: data,
      });
    }

    console.log("[enhance] ✓ Generated image successfully");
    return res.json({ success: true, image: b64 });
  } catch (err) {
    console.error("[enhance] Server error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🎨 Little Gallery server running at http://localhost:${PORT}\n`);
  console.log(`  Open the URL above in your browser to start.\n`);
});
