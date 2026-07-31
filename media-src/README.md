# Hero video originals

`hero.mp4` and `hero-mobile.mp4` in this folder are the **originals** as delivered:
1600×900 @ 2.1 Mbps (6.9 MB) and 960×540 @ 0.7 Mbps (2.3 MB), 27 s, 30 fps, no
audio track. This project is not under version control, so these files are the
only copy — don't delete them.

**These are also what currently ships from `/public`.** A smaller re-encode was
tried and reverted for looking too soft. The rest of this file is the measurement
record, so the same ground doesn't get re-covered.

## What was measured

| Encode | Size | Verdict |
|---|---|---|
| Original, 1600×900 30 fps | 6.9 MB | **shipping** |
| 1600×900, CRF 27, no denoise | *larger than source* | pointless |
| 1280×720, CRF 30, no denoise | 3.4 MB | modest saving, still soft |
| 1280×720, CRF 28, no denoise | 4.8 MB | untested visually |
| 1280×720, CRF 33 + hqdn3d + 24 fps | 1.7 MB | **rejected — too blurry** |
| 854×480, CRF 34 + hqdn3d + 24 fps | 1.0 MB | rejected with it |

The two findings that matter:

**Re-encoding at native resolution does not shrink this footage.** It's noisy, and
x264 spends its bitrate describing sensor grain — it needs more bits than the
source used to hold that much noise, so CRF 27 at 1600×900 comes out *larger* than
the file it came from.

**Denoising is what unlocks the big savings, and it's also what causes the blur.**
`hqdn3d=3:2:4:4` freed enough bitrate to reach 1.7 MB, but the grain it removes is
largely the water texture on the clarifier surface — the one element in frame that
reads as detail. On a still, behind the 45% scrim, the difference looked
acceptable. In motion it did not.

## The remaining lever

Duration, and it's the only one that costs nothing visually. The clip is 27
seconds and loops; cutting it to ~10 s is the same picture at roughly a third of
the weight, because the loop point is a hard cut either way. That's a content
decision, so it hasn't been taken.

## If you do want to re-encode

Always work from the files in this folder, never from `/public`. The rejected
recipe, kept for reference — raise CRF *down* and drop `hqdn3d` to trade size back
for sharpness:

```bash
ffmpeg -y -i media-src/hero.mp4 \
  -vf "scale=1280:720:flags=lanczos,hqdn3d=3:2:4:4,fps=24" \
  -c:v libx264 -preset slow -crf 33 -maxrate 550k -bufsize 1100k \
  -pix_fmt yuv420p -movflags +faststart -an public/hero.mp4
```

`-movflags +faststart` puts the moov atom first so playback can begin before the
file is fully downloaded. `-an` because the hero is muted and a silent audio track
is pure overhead.

## Deliberately no WebM/AV1

H.264 has hardware decode on essentially everything, and hardware decode is the
point — the hero should not cost main-thread and GPU time while it plays. VP9
tested *larger* than H.264 at matching quality on this clip, and AV1 would trade
bytes back for software decode on any device without an AV1 block.

## Deliberately not a YouTube embed

Tried and reverted. YouTube draws its video title and channel avatar along the top
edge, its wordmark and a share button along the bottom, and a control overlay dead
centre whenever the player isn't playing. No embed parameter turns those off —
`modestbranding` used to hide the wordmark and YouTube removed it in August 2023.
Overscaling the iframe crops the top and bottom bands but never the centre one. It
also costs more JavaScript than the video file it replaces.
