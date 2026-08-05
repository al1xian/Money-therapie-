# Legal pages and order tracking

## Where the legal text lives

The five documents are written in `app/data/legal.ts` and rendered by
`app/routes/legal.$handle.tsx`:

| Page | URL |
| --- | --- |
| Terms & Conditions | `/legal/terms` |
| Shipping Policy | `/legal/shipping` |
| Return & Refund Policy | `/legal/returns` |
| Privacy Policy | `/legal/privacy` |
| Legal Notice | `/legal/legal-notice` |

They live in the repo rather than in Shopify Admin's policy editor for two
reasons: they are versioned with the code and reviewable in a diff, and Shopify
has no slot at all for a French *mentions légales*, which a site selling into
France is required to publish.

## ⚠ Before this goes live

Several passages carry a visible `⚠ to be completed` marker and render in red
on the page. They are the company's real details:

- registered company name
- registered address
- SIREN / company registration number
- intra-community VAT number
- name of the publication director
- support email address

They are deliberately loud. A plausible invented address would be worse than an
obvious gap, because nobody would ever notice it. Fill them in at the top of
`app/data/legal.ts` — each appears once, in a constant, and flows to every page
that needs it.

While you are there, read the documents. They are written from how this store
actually operates — 1 to 3 business days to ship, 48 hours in France, 30 days
to return, free shipping over €150. **If any of that changes, the text has to
change with it.** A shipping policy that does not describe your shipping is
worse than none.

## Shopify's own policies still exist

Shopify Admin → Settings → Policies holds a separate set of documents, and
Shopify's hosted checkout links to *those*, not to these. The `/policies/*`
routes still render them.

So: paste the same text into the Admin policies once the blanks are filled.
Otherwise a customer sees one set of terms on the storefront and another at
checkout — which, on the terms that govern the sale, is a real problem rather
than an untidy one.

## Order tracking

`/order-tracking` takes an order number and an email address and shows the
status, carrier, tracking number, dispatch date, delivery estimate and the full
event history for each parcel.

### Why it asks the customer to confirm their email

Shopify does not expose order data to an unauthenticated caller, and that is
the right design: an order number is a small sequential integer, so a number
plus a guessed email would let anyone walk other people's addresses and
purchase history.

The lookup therefore runs against the **Customer Account API**. A visitor who
has not been identified yet is sent to `/account/login` with two parameters:

- `login_hint` — the address they just typed, so Shopify prefills it
- `return_to=/order-tracking` — read by Hydrogen when the authorisation comes
  back, which is what returns them to the tracking page instead of the account
  dashboard

Shopify emails them a one-time code. There is no password to create, so it
costs the customer one extra click and an email — not an account.

Once identified, the email field is still checked, against the address on the
order itself.

### What it needs to work

Nothing beyond what the store already has: the Customer Account API is the same
one `/account` uses. If `/account/login` works, tracking works.

An order with no fulfilment yet shows "confirmed and being prepared" rather
than an empty table — which is the honest answer for the first one to three
days.
