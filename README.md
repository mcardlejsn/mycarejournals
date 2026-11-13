# My Care Journals website chat bubble

The website files add an “Ask about the app” bubble in the bottom-right corner.
Visitors open it to ask questions. The panel supports short follow-up conversations,
English and Spanish replies, closing with Escape, and mobile screen widths.
Conversation history stays in page memory and clears on reload.

## Files

- website/index.html is based on the live homepage retrieved November 13, 2026.
  Its only change is the script tag loading mcj-chat.js before the closing body tag.
- website/mcj-chat.js contains the bubble and chat panel.
- cloudflare/worker.mjs handles questions through Workers AI.
- cloudflare/wrangler.jsonc supplies the AI binding and a rate limit.

The public endpoint is pending. The script tag in index.html contains
REPLACE-WITH-YOUR-WORKER until Cloudflare provides a hosted URL.
The public website is served by GitHub Pages, which requires an external
backend for AI requests.

## Publish the backend when ready to make it available

These steps publish a new Cloudflare Worker. Run them when you have decided to
enable hosting for this chatbot.

Open a terminal in this package's cloudflare folder and run

```bash
npx --yes --package=node@22 --package=wrangler@4 -- wrangler deploy
```

Wrangler uses your Cloudflare sign-in. If it asks you to log in, use

```bash
npx --yes --package=node@22 --package=wrangler@4 -- wrangler login
```

A workers.dev account subdomain is required for the public endpoint.
Complete its registration if prompted. This requirement remains for hosting,
even though the earlier Python test used the REST API.

Use the Workers Free account if you want requests to stop at the free daily
AI allowance. Paid accounts can incur usage charges beyond the allowance.
https://developers.cloudflare.com/workers-ai/platform/pricing/

The configuration applies 10 requests per minute per visitor IP within each
Cloudflare location. This is an approximate rate limit, not a hard daily spending
cap. namespace_id 1001 is used for this limiter. If you already have an unrelated
rate limiter with that ID, choose an unused positive integer.
https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

## Connect the website

Wrangler prints a URL such as
https://my-care-journals-chat.YOUR-SUBDOMAIN.workers.dev.

In website/index.html, replace
https://REPLACE-WITH-YOUR-WORKER.workers.dev/api/chat
with that Worker URL followed by /api/chat.

Upload website/index.html and website/mcj-chat.js to the website root
through your existing publishing workflow. The cloudflare folder is the
backend source and stays out of the website upload.

The Worker uses its AI binding. The website script contains the public endpoint
URL only. Keep the API token used by the Python test in your private terminal workflow.

## Check the published version

Open mycarejournals.com and select “Ask about the app.” Ask whether the
dementia journal is free, then ask what Caregiver Plus adds. Check a Spanish
question, a follow-up, and opening and closing the panel on your phone.

The assistant uses facts from the homepage. Review its answers before relying
on them for customer support. The widget tells visitors that messages go to
Cloudflare and asks them to leave out personal and medical details.

## Verification completed

JavaScript syntax checks passed. Simulated tests passed for opening and closing
the bubble, follow-up history, safe text rendering, retry handling, CORS,
request validation, rate limits, and AI service failures.

The homepage was compared with the live HTML. Removing the new chat script tag
reproduces the original file exactly, including the Cloudflare analytics script.

A browser layout inspection and a live test of this hosted Worker are still pending.
The earlier Python chatbot successfully generated a live answer on your computer.
