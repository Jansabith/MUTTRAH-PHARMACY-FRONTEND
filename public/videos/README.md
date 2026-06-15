Place the home hero video here:

- Required filename: `muttrah-hero.mp4`
- Temporary MOV fallback filename: `muttrah-hero.MOV`
- Best compatibility: MP4, H.264 video, no audio, 1920x1080 or 1280x720
- Good low-size target: 8 to 12 seconds, 24 or 30 fps, around 3 to 8 MB
- For the smallest file later, export WebM separately and add it as another video source.

The React hero uses `/videos/muttrah-hero.mp4` first, then tries `/videos/muttrah-hero.MOV`.

Current `muttrah-hero.MOV` is HEVC/H.265 (`hvc1`), which Chrome may not play.
Convert or export it as H.264 MP4 and name it `muttrah-hero.mp4`.
