# Browser motion flyer

HTML + CSS + Canvas only. No external dependencies, AI video, sound, or camera transforms. Original local PNG: `assets/stadium.png` (1054 × 1492).

From the project root run `python3 -m http.server 8000` and open the root index.html or cinematic/index.html in a browser. Alternatively, open CINEMATIC-FLYER.html directly: this standalone file embeds the CSS, JavaScript and original image.

Ten-second sequence: soft golden smoke wisps drift upward and sideways behind the stationary football; fitted masks contain a white diagonal sweep on the left crest followed by a warm gold sweep on the right; a gold-pixel mask adds a subtle VS pulse. No other lighting or particle effects are enabled. All mask coordinates are proportional to the original artwork. CSS scales the complete canvas without cropping.

Play, pause, restart and timeline controls sit outside the artwork. CONFIG at the beginning of cinematic.js contains intensity, timing and mask settings. All motion is deterministic and periodic. Existing MP4 files are older revisions and are not the delivery for this browser implementation.
