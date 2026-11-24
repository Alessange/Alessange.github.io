# Rules for agents editing this homepage

Owner: Towa Shixun Huang. These are his standing rules for `index.html` / `stylesheet.css`.

## News
- Concise: every item fits on ONE line on desktop (date + a few words, e.g. "Released PRIO." / "Closing Trajectories accepted to SCA 2026.").
- No explanations or taglines in news items; link the paper / venue name instead.
- Show the 3 most recent by default ("Recent news" / "All news" toggle).

## Publications
- Default view = "Selected" (toggle "Selected" / "All"); selected items carry `data-selected="1"`.
- His first authorship is marked ON HIS NAME (not with a label): in `publication-item first-author` his `author-self` name is bold, blue, italic; as a co-author his name is just bold.
- Every paper has a TL;DR (`<p class="publication-note"><b>TL;DR</b> ...</p>`): its text fills exactly one line, one and a half lines, or two full lines at desktop width (prefer one line) -- never a short dangling tail on the last line; check by measuring the rendered line count.
- Venue line: arXiv-only papers show NO venue line (the Paper link goes to arXiv). Accepted / published papers show the venue in the highlight colour (`p.venue-accepted`).
- No topic categories / coloured tags.
- Thumbnails: use the images he provided; never crop them -- shrink the whole image into a 4:3 frame (640x480) padded with the page background (#fcfcfa); animated GIFs become muted looping MP4s with a poster.
- Order: PRIO, Odd-DC, WorldContact, Closing Trajectories, then the rest.
- PRIO (arXiv 2611.25500, project page `prio/`): never mention CVPR or any venue / "under review" (CVPR 2027 policy).

## Experience
- Do not list his PhD as an experience entry.

## Style
- Visually minimal: near-white background, hairline separators, no cards / shadows / gradients / coloured boxes.
- Compact: content column about 1000 px wide; do not add large side margins.

## Workflow
- Preview changes before committing; ask the owner before every push.
- `prio/` is a separate project page (source: projects/demo/site_public); do not edit it here by hand.
