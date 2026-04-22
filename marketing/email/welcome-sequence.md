# Dated — Welcome Email Sequence

3 emails sent after signup. All sent via Resend from hello@getdated.app.

---

## Email 1 — Welcome (send immediately on signup)

**Subject:** Welcome to Dated 👋

```
Hey [first_name],

You just joined Dated — and we're glad you're here.

Here's what to do first:

**Write your first review.**
Think of the last date you went on. Where did you go? How was the food? The vibe? Give it a rating. It takes 2 minutes and it'll be the start of your date history.

→ Write a review: https://getdated.app/write

**Browse Vancouver dates.**
There are already reviews from couples in your city. Check out what's trending, find a new spot, or just see how other couples rate their nights out.

→ Explore the feed: https://getdated.app

That's it for now. More soon.

— Jason
Founder, Dated

P.S. If you have a favourite date spot in Vancouver, we want to know about it. Write the review.
```

---

## Email 2 — Nudge (send 3 days after signup if no review written)

**Subject:** Your first review is waiting

```
Hey [first_name],

You signed up for Dated a few days ago but haven't written your first review yet.

That's fine — life gets busy.

But here's a thought: think about the last date you went on. Even if it was just grabbing coffee. Even if it was a few months ago.

Write the review. Give it a rating. Add one sentence about why it was good (or not).

That's it. Your date history starts with one review.

→ Write it now: https://getdated.app/write

— Jason

P.S. The aburi salmon oshi at Miku has a 5/5 ambiance rating on Dated right now. Just saying.
```

---

## Email 3 — Feature discovery (send 7 days after signup)

**Subject:** Did you know about Date Builder?

```
Hey [first_name],

Quick one — have you tried Date Builder yet?

It's one of our favourite features on Dated. Here's how it works:

1. Create a new date plan
2. Add stops — dinner, drinks, an activity, whatever
3. Give each stop a note and a time
4. Share a single link with your partner

No more back-and-forth texts. No more "where are we going again?"

→ Try Date Builder: https://getdated.app/date-builder/new

A few other things worth exploring:

**Collections** — save reviews you want to try into lists. "Anniversary ideas." "Budget date nights." "Spots to take my parents." Whatever works.

**Insights** — once you've written a few reviews, your Insights page shows your date history as a heatmap, your average ratings, and achievement badges.

More coming soon.

— Jason, Dated
```

---

## Notes for Implementation

- Trigger Email 1 immediately on `auth.users` insert (via Supabase webhook or after signup server action)
- Trigger Email 2 via a Vercel Cron that checks for users with no reviews after 3 days
- Trigger Email 3 via a Vercel Cron at day 7
- Use `marketing_opt_in` field on profiles — only send marketing emails to opted-in users
- Transactional email (Email 1) can go to everyone regardless of opt-in
