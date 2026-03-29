# Dated — Architecture & Stack Decisions

## Overview

Public read / account-gated write platform for posting, rating, ranking, and reviewing dates.
Web-first, mobile to follow.

---

## Recommended Stack

### Frontend — Web
| Layer        | Choice          | Why                                                        |
|--------------|-----------------|------------------------------------------------------------|
| Framework    | **Next.js 14+** (App Router) | SSR for SEO on public pages, API routes, easy Vercel deploy |
| Styling      | **Tailwind CSS** + CSS variables | Utility-first + easy to wire up brand tokens              |
| UI components| **shadcn/ui**   | Accessible, unstyled-base, easy to theme in purple         |
| State        | **Zustand** or React Context | Lightweight; full Redux overkill for this scope           |

### Frontend — Mobile (future)
| Layer        | Choice          | Why                                                        |
|--------------|-----------------|------------------------------------------------------------|
| Framework    | **Expo** (React Native) | Share logic with web, OTA updates, no native build pain   |
| Navigation   | **Expo Router** | File-based, mirrors Next.js mental model                   |

---

### Backend / BaaS
**Supabase** (Postgres + Auth + Storage + Edge Functions)

- Postgres gives you proper relational data (users → reviews → places)
- Row-Level Security (RLS) enforces "read public, write authenticated" at the DB layer
- Built-in Auth with email/password, OAuth (Google, Apple), magic links
- Storage for user-uploaded photos
- Edge Functions for custom logic (e.g. place data refresh jobs)
- Generous free tier; scales predictably

---

### Hosting
| Service      | What goes there                                   |
|--------------|---------------------------------------------------|
| **Vercel**   | Next.js web app (free tier fine to start)         |
| **Supabase** | Database, Auth, Storage, Edge Functions           |
| **Cloudflare** (optional later) | CDN, image optimization, DDoS  |

---

### Location / Place Data
Strategy: **Google Places API** as source of truth, cached in your own DB.

1. When a user adds a date venue, search Google Places → store the `place_id` + snapshot (name, address, hours, cuisine tags) in Supabase.
2. A **scheduled Supabase Edge Function** (cron) re-fetches each `place_id` periodically (e.g. weekly) to refresh hours and status.
3. For menus: Google Places has limited menu data. Supplement with **Yelp Fusion API** (free tier) or let users manually add menu highlights.
4. Users can flag stale info → triggers a priority refresh.

Cost: Google Places has a free monthly credit ($200) that covers significant volume before billing starts.

---

### Sharing (public read, no sign-in required)
- Every date review gets a stable public slug URL: `dated.app/r/[slug]`
- Next.js generates **Open Graph meta tags** server-side for rich link previews (image, title, rating)
- No auth required to view — enforced by Supabase RLS (`SELECT` allowed for `anon` role, `INSERT/UPDATE/DELETE` require authenticated role)
- Short share links can be generated client-side (no third-party shortener needed to start)

---

### Authentication & Account Flow
1. User hits "Write a Review" or "Rate" → redirect to `/signup` if not logged in
2. Sign-up form collects: email, password (or OAuth)
3. **Required before account creation:**
   - [ ] Accept Terms & Conditions (versioned, timestamp stored in DB)
   - [ ] Accept Privacy Policy
   - [ ] Marketing email opt-in checkbox (separate, CAN-SPAM / GDPR compliant — must be unticked by default)
4. Store in `users` table: `tos_accepted_at`, `tos_version`, `marketing_opt_in`, `marketing_opt_in_at`
5. Supabase Auth handles session tokens, refresh, password reset emails

---

### Email / Marketing
| Service      | Use                                               |
|--------------|---------------------------------------------------|
| **Resend**   | Transactional email (welcome, password reset)     |
| **Loops** or **Mailchimp** | Marketing campaigns to opted-in users |

Sync: on sign-up, if `marketing_opt_in = true`, add to marketing list via webhook/Edge Function.

---

## Data Model (simplified)

```
users           id, email, display_name, avatar_url, tos_accepted_at, marketing_opt_in, created_at
places          id, google_place_id, name, address, lat, lng, hours_json, last_refreshed_at
reviews         id, user_id, place_id, slug, title, body, overall_rating, ambiance, food, service, value, photos[], is_public, created_at
ratings         id, user_id, review_id, score (for others rating a posted review)
date_tags       id, label (e.g. "first date", "anniversary", "group")
review_tags     review_id, tag_id
```

---

## Key Architecture Principles

- **Public by default, write-gated by auth** — enforced at DB level with RLS, not just UI
- **Google Places as source of truth** for venue data; you cache, you own the refresh cadence
- **No required sign-in for viewing or sharing** — SEO-friendly, low friction for sharing links
- **Marketing consent is explicit and stored** with timestamp and version for legal compliance
- **Mobile reuse** — keep business logic in shared hooks/utils so Expo can consume them later

---

## Next Steps

1. [ ] Decide on domain / brand name lock (dated.app, getdated.co, etc.)
2. [ ] Finalize branding (see BRANDING.md)
3. [ ] Bootstrap Next.js project + Supabase project
4. [ ] Draft T&C and Privacy Policy (consult a lawyer for marketing email clauses)
5. [ ] Set up Google Places API key + billing account
6. [ ] Design DB schema + RLS policies
7. [ ] Build public review page first (highest SEO/sharing value)
