# Domain cutover runbook - vetpathusa.com

Decision made August 14, 2026: primary domain is **vetpathusa.com**
(brand stays VetPath; "VetPath USA" doubles as a natural entity name if
the nonprofit fork lands). Availability confirmed at the Verisign
registry immediately before this was written - register the same day.

**STATUS: CUTOVER COMPLETE (Aug 13-14, 2026).** Phases 1-3 all done:
domain registered at Cloudflare, DNS in (grey-cloud/DNS only), Pages
custom domain + HTTPS enforced, github.io 301s verified, SITE flipped,
QRs/print/share regenerated, Supabase URL config updated, sign-in round
trip verified on the new domain. Also done: sitemap.xml + robots.txt
live, and SPF (`@ TXT "v=spf1 -all"`) + DMARC
(`_dmarc TXT "v=DMARC1; p=reject; rua=mailto:kalebaverell@gmail.com"`)
records added and verified on 1.1.1.1 - the domain sends no email, so
these shut the spoofing door Cloudflare's recommendation flagged. When
Resend SMTP lands, its SPF include + DKIM records will replace/extend
these (Resend's instructions win at that point).

Remaining items live in "Unblocked by this cutover" below - all Kaleb's
hands.

## Phase 1 - Kaleb's hands (about 10 minutes)

### 1. Register the domain
Any registrar works. Easiest paths:
- GoDaddy (account likely exists from the search): search vetpathusa.com,
  standard registration ~$12-20 first year. Decline every upsell (no
  website builder, no email bundle, no "full protection" - WHOIS privacy
  is the one thing worth keeping ON, and it's usually free/default).
- Cloudflare Registrar or Porkbun if renewal price matters (~$10-11/yr,
  no upsells).

Optional but recommended in the same checkout: **vetpathhq.com** (~$12) as
a defensive pickup - it was the runner-up and the one someone else might
take. It just redirects later; no other work needed.

### 2. Add the DNS records (registrar's DNS panel)
Delete any pre-filled "parked" A/CNAME records first, then add:

| Type  | Host | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| AAAA  | @    | 2606:50c0:8000::153 |
| AAAA  | @    | 2606:50c0:8001::153 |
| AAAA  | @    | 2606:50c0:8002::153 |
| AAAA  | @    | 2606:50c0:8003::153 |
| CNAME | www  | kalebaverell.github.io |

(The four A + four AAAA records are GitHub Pages' published addresses;
www CNAMEs to the Pages hostname. TTL: whatever the default is.)

### 3. Say "DNS is in" in the chat
That's the handoff. Everything below runs from here.

## Phase 2 - Claude's hands (same day, after DNS propagates)

1. Set the Pages custom domain:
   `gh api -X PUT repos/kalebaverell/kalebaverell.github.io/pages
   -f cname=vetpathusa.com` - GitHub provisions the TLS certificate
   (minutes to ~1 hour), then enforce HTTPS. github.io URLs begin
   301-redirecting to the new domain automatically, so every link, QR,
   and bookmark already in the wild keeps working.
2. Flip `SITE` in lib/metadata.ts to https://vetpathusa.com (canonical
   URLs, OG cards, manifest), rebuild, deploy, verify live.
3. Regenerate the print pieces: new QR codes (campaign tags preserved)
   and URL text on the VSO one-pager + Texas checklist; remove the
   "temporary address" caveat from the one-pager. Re-render PDFs.
4. Update the tester round-3 message file and share package; republish
   the artifact.
5. Verify the full gauntlet on the new domain: pages, sign-in round trip,
   analytics count, first-touch capture, service-worker update.

## Phase 3 - Kaleb's dashboards (guided, ~5 minutes, after Phase 2)

1. **Supabase** (supabase.com/dashboard -> project evoswsnsjoslcqllefgc ->
   Authentication -> URL Configuration): set Site URL to
   `https://vetpathusa.com`, and ADD `https://vetpathusa.com/**` to
   Redirect URLs. Keep the kalebaverell.github.io entries during the
   transition - remove them a few weeks later.
2. **Google OAuth**: no redirect change needed (Google returns to the
   Supabase callback, which is unchanged). Optional polish later: add
   vetpathusa.com to the OAuth consent screen's authorized domains so the
   consent prompt shows the real domain.
3. **GoatCounter** (vetpath.goatcounter.com -> settings): no change needed
   for counting; optionally note the new domain in site settings for
   referrer hygiene.

## Unblocked by this cutover (queue next)

- **Resend SMTP** (parked since Aug 5): Kaleb creates the Resend account,
  verifies vetpathusa.com (DNS TXT records), makes an API key; then wire
  Supabase SMTP (host smtp.resend.com, port 465, user "resend", password
  = the key, sender no-reply@vetpathusa.com) and test a password reset to
  a non-team address.
- **Search Console + sitemap**: add the domain property (DNS TXT), submit
  a sitemap - first real SEO step.
- **Email addresses** (kaleb@vetpathusa.com): any host; Cloudflare Email
  Routing forwards for free if the DNS lives there.
- Ad Grants application becomes possible the day a 501(c)(3) exists - the
  domain-ownership requirement is now satisfiable.
