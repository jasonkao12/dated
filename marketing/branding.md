# Dated — Brand Guide

---

## Brand Overview

**Name:** Dated  
**Tagline:** Date better.  
**Mission:** Help couples document, remember, and improve their date life — one review at a time.  
**Category:** Lifestyle / Social / Date planning  
**Target audience:** Couples (25–40), urban, experience-driven, not looking for a dating app — they're already together and want to get more out of their time.

---

## Brand Personality

Dated is like your favourite friend who always knows the best spot — warm, direct, a little playful, never pretentious. It celebrates real experiences over aspirational ones. A rainy night at a hole-in-the-wall taco spot with a 10/10 vibe is just as valid as a fine dining anniversary.

**Five adjectives that define Dated:**
- Warm
- Honest
- Playful
- Minimal
- Local

---

## Voice & Tone

**Do:**
- Write like a real person talking to a friend
- Use short sentences
- Be specific ("the aburi salmon" not "great food")
- Celebrate imperfect but memorable dates
- Use light humour when appropriate

**Don't:**
- Be cringe-romantic or over-the-top
- Use corporate speak ("leverage", "synergy", "optimize your relationship")
- Punch down or mock bad dates (keep it fun, not mean)
- Use excessive emojis (1–2 max per post, never in headers)

**Example copy (on-brand):**
> "The pasta was cold. The wine was perfect. Still a 9/10."

**Example copy (off-brand):**
> "Discover amazing romantic experiences and optimize your couple's journey together! 💕💕💕"

---

## Color Palette

All hex values are approximate — use the CSS variables in `web/app/globals.css` as the source of truth.

| Name | Hex | Usage |
|---|---|---|
| **Primary Purple** | `#734e97` | Primary buttons, links, brand accent |
| **Dark Purple** | `#5a3a78` | Hover states, dark accents |
| **Light Purple** | `#EAB8FF` | Secondary backgrounds, tags, chips |
| **Sky Blue** | `#83D6E6` | Accent colour, highlights, write button |
| **Off Grey** | `#F0F0E9` | Page background (light mode) |
| **Deep Plum** | `#2D1F3D` | Body text (light mode) |
| **Muted Mauve** | `#8A7E9A` | Secondary text, captions |
| **Rosy Red** | `#E0536A` | Error states, destructive actions |
| **Sage Teal** | `#4CAF8A` | Success states |

**Dark mode background:** approximately `#1a1324` (deep plum)  
**Dark mode primary:** slightly brighter purple for contrast

### Gradient (for hero / marketing use)
```
linear-gradient(135deg, #734e97 0%, #83D6E6 100%)
```
Purple-to-sky-blue. Use sparingly — only for hero sections or large feature callouts.

---

## Typography

**Font:** Nunito (Google Fonts)  
**Weights used:** 400 (body), 600 (semibold), 700 (bold), 800 (extrabold)

| Element | Weight | Notes |
|---|---|---|
| Display / Hero | 800 Extrabold | Large, tight tracking |
| H1 | 700 Bold | |
| H2 / H3 | 600–700 | |
| Body | 400 Regular | Comfortable line height |
| Labels / Caps | 600, uppercase, tracked | e.g. "REVIEWS · 12" |
| Monospace | Geist Mono | Codes only (invite codes, etc.) |

---

## Logo

### Design Concept
The Dated wordmark uses **Nunito Extrabold** — the same font as the app. Clean, rounded, modern. No decorative flourishes. The "D" can optionally carry a small calendar/heart hybrid icon mark for the app icon.

### Icon Mark
A minimalist calendar page with a small heart in the date square. Purple on white, or white on purple. No gradients in the icon — solid fills only.

### Variants Required

| File | Background | Use |
|---|---|---|
| `logo-primary.svg` | Transparent | General use, light backgrounds |
| `logo-dark.svg` | Transparent | Dark backgrounds |
| `logo-white.svg` | Transparent | Photography overlays, dark fills |
| `logo-black.svg` | Transparent | Print, emboss |
| `logo-purple-bg.svg` | #734e97 | App store icon, social avatar |
| `logo-horizontal.svg` | Transparent | Email headers, website header |
| `logo-stacked.svg` | Transparent | Square format uses |
| `app-icon-1024.png` | #734e97 | App Store / Play Store |
| `favicon.ico` | - | Web |

### Logo Rules
- Minimum size: 24px height for icon, 80px for wordmark
- Clear space: equal to the height of the "D" on all sides
- Never stretch, rotate, or recolour outside the approved palette
- Never put the purple logo on the purple background

---

## App Icon

Square format, rounded corners (follow platform spec).  
Background: Primary Purple `#734e97`  
Icon: White calendar-heart mark, centred  
Wordmark: Optional below icon for larger sizes

---

## Photography & Visual Style

**For marketing content:**
- Real couple photography — candid, not posed
- Low light, restaurant environments, golden hour outdoors
- Vancouver locations preferred (mountains, water, Gastown, Main Street)
- Warm but not oversaturated
- No stock-photo couples (arms around each other, forced smiles)

**For app screenshots:**
- Use the actual app UI — no mockups with fake data
- iPhone 15 Pro frame, space black
- Clean background: off-grey or white

**Avoid:**
- Red roses / valentine clichés
- Overly romantic / soft focus filters
- Clipart or cartoon hearts

---

## Social Media Presence

| Platform | Handle | Priority |
|---|---|---|
| Instagram | @getdated | High |
| TikTok | @getdated | High |
| X / Twitter | @getdated | Medium |
| Reddit | r/dated (or post to r/vancouver) | Low |

---

## SEO Brand Keywords

- "date review app"
- "rate your dates"
- "best date spots Vancouver"
- "couples review app"
- "date night tracker"
- "date planner Vancouver"

---

*Last updated: April 2026*
