# Assets — PersonaliTatto

All application assets listed here are stored in `public/` and require no third-party image or font requests at runtime.

## Original tattoo illustrations

The six SVG flash illustrations were drawn as editable vector code for this MVP. Each has a transparent 400 × 500 viewBox, charcoal ink (`#252722`), and warm ivory interiors (`#e9e6dc`). The ivory interiors make overlapping details legible and are intended for warm gallery cards; the files are not solid black stencil masks.

| Asset              | Subject                                           |
| ------------------ | ------------------------------------------------- |
| `/art/serpent.svg` | Coiled serpent, moon, fine curved scale engraving |
| `/art/moth.svg`    | Symmetrical death-head moth and engraved eyespots |
| `/art/rose.svg`    | Layered botanical rose with leaves and thorns     |
| `/art/dagger.svg`  | Ornamental wrapped-hilt dagger and climbing rose  |
| `/art/tiger.svg`   | Symmetrical blackwork tiger portrait              |
| `/art/swallow.svg` | Flying swallow with swept feathered wings         |

No stock illustrations, external art libraries, or artist portfolio works are included in these SVGs. The illustrations are demonstration flash assets, not representations of real artists' work.

## Original generated studio imagery

The three PNG files were generated with the built-in `image_gen.imagegen` tool. They are synthetic editorial-style imagery for the MVP, not photographs of actual registered studios or the featured demo artists. Original generated files were copied into this repository without image edits, crops, or resampling.

| Asset                  | Dimensions  | Subject                                                                |
| ---------------------- | ----------- | ---------------------------------------------------------------------- |
| `/images/studio-1.png` | 1536 × 1024 | Cinematic dark boutique studio, factory windows and black tattoo chair |
| `/images/studio-2.png` | 1536 × 1024 | Tattoo artist working on a botanical forearm piece                     |
| `/images/studio-3.png` | 1536 × 1024 | Intimate atelier with concrete arch, flash wall, and warm side light   |

### Final prompts

**studio-1.png**

Use case: photorealistic-natural. Asset type: premium tattoo studio editorial cover photo for a website. Primary request: A cinematic candid photograph of a beautiful boutique tattoo studio in São Paulo, Brazil. Dark charcoal painted walls, warm dim hanging lamps, clean black leather tattoo chair, sculptural steel furniture, concrete floor, large black-framed factory windows softly casting late-afternoon light, tasteful framed tattoo flash drawings on a far wall, one large plant. Composition: horizontal wide landscape photo, a strong photographic frame and lived-in but immaculate space, realistic lens. Color palette: desaturated charcoal, olive and warm cream, subtle analog grain. Editorial photography with natural material texture. No people, no readable text, no logos, no watermarks. Deliver one finished original landscape photograph, no borders.

**studio-2.png**

Use case: photorealistic-natural. Asset type: premium tattoo artist editorial website cover photo. Primary request: a candid cinematic close photograph of a Brazilian tattoo artist at work in a sophisticated dark studio, focused tattooed adult male artist in black t-shirt leaning towards a client's forearm, black nitrile gloved hands holding a tattoo pen, healthy skin with intricate black fine-line botanical tattoo, no injury or blood. Subject framed naturally off-center with beautiful warm overhead task lighting, textured charcoal studio wall in deep background, blurred framed artwork, genuine documentary feeling. Composition: horizontal landscape editorial photograph, waist-up crop with tattoo work prominent, natural anatomical hands. Color palette: desaturated olive and charcoal with warm cream skin tones, analog film grain. No text, no logos, no watermarks, no borders.

**studio-3.png**

Use case: photorealistic-natural. Asset type: premium creative tattoo studio editorial website cover photo. Primary request: A beautiful cinematic interior photograph of a small independent tattoo atelier in a converted industrial building in São Paulo, Brazil. Large concrete arched doorway, cream plaster and dark charcoal walls, one black leather tattoo chair, a workbench with vintage steel drawers, glowing warm task lamp, minimalist wall of monochrome fine-line tattoo flash art in mismatched black frames, lush olive-toned plant near a tall textured glass window. The quiet atmosphere of a creative workshop, tactile surfaces, sophisticated but authentic rather than luxurious hotel. Composition: horizontal landscape photograph with intimate lower eye-level camera framing and depth from foreground into softly lit studio, natural late afternoon side light. Desaturated charcoal, cream, faded olive, warm amber highlights, subtle analog grain. Empty room, no people, no readable text, no logos, no watermark, no border.

## Locally served fonts and licenses

- `/fonts/manrope.ttf`: Manrope variable, weights 200–800, sourced unmodified from the [Google Fonts Manrope source](https://github.com/google/fonts/tree/main/ofl/manrope). Copyright 2018 The Manrope Project Authors (https://github.com/googlefonts/manrope), as stated in the bundled license. Licensed under SIL Open Font License 1.1; the complete license is included at `/fonts/MANROPE-OFL.txt`.
- `/fonts/permanent-marker.ttf`: Permanent Marker Regular, weight 400, by Font Diner. Sourced unmodified from the [Google Fonts Permanent Marker source](https://github.com/google/fonts/tree/main/apache/permanentmarker). Copyright (c) 2010 by Font Diner, Inc. All rights reserved, as stated in the upstream metadata. Licensed under Apache License 2.0; the complete license is included at `/fonts/PERMANENT-MARKER-LICENSE.txt`, and upstream attribution metadata at `/fonts/permanent-marker-METADATA.pb`.

Keep the corresponding license and attribution files with redistributed copies of the font files.
