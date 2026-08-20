# Second-piece offer — 30% off the second item

The product page shows a "take two" box: this piece plus a suggested second
one, with 30% already taken off. The reduction then appears in the cart and at
checkout on its own.

**The offer is not tied to that pair.** It is a discount on the basket, so it
applies to whatever second piece the customer picks. The box is just the
shortest route to it.

A storefront cannot change a price: what the customer pays is decided by
Shopify. So the offer needs a real discount to exist in Shopify.

> **Until it does, the page announces −30% that the cart will not apply.**
> Create it before promoting the offer. Nothing breaks in the meantime, but the
> customer is shown a price they will not get.

## Create the discount (once, ~2 minutes)

1. **admin.shopify.com** → your store → **Discounts** → **Create discount** →
   **Buy X get Y**.
2. **Method**: **Automatic discount** — *not* "Discount code". Nothing to type,
   nothing to leak, and it applies to everyone.
3. **Title**: what the customer will see on their receipt, e.g.
   `Second piece −30%`.
4. **Customer buys**: *Minimum quantity of items* → `1` → **Any product** (or
   your whole-catalogue collection).
5. **Customer gets**: quantity `1` → the same set → **Percentage** → `30`.
6. **Maximum discount uses**: tick *Limit to one use per order*. Without it a
   basket of six gets three items discounted rather than one.
7. Set the active dates and **Save**.

### Check this on your first test

Shopify applies "buy X get Y" to the **cheapest** eligible item. Add a €90
piece and a €35 piece: the €35 one should be the one that drops, saving
€10.50 — not €27. The product page's estimate follows that rule
(`pairSaving` in `app/lib/offers.ts`). If your test shows Shopify choosing
differently, tell me and I'll change the one function that computes it.

The cart never depends on that rule: it reports the figure Shopify actually
allocated, so it stays correct either way.

## If you'd rather have a code

Create the same discount as a **Discount code** instead, then put that code in
`app/lib/offers.ts`:

```ts
export const OFFER_DISCOUNT_CODE: string = 'PACK30';
```

The storefront then attaches it to the cart after every change, so the customer
still doesn't have to type it — they just get to see it. Never run a code and
an automatic discount for the same offer at once, or the reductions stack.

## Changing the percentage

Change it in Shopify **and** in `app/lib/offers.ts`:

```ts
export const SECOND_ITEM_DISCOUNT_PERCENT = 30;
```

The storefront uses this figure only to display the estimate. If the two
disagree, the customer sees one price and pays another.

## Turning the offer off

```ts
export const OFFER_ENABLED = false;
```

The box then shows both pieces at full price and the cart note disappears.
Deactivate the discount in Shopify too, or it will keep applying.

## How the storefront reads it

- `app/lib/offers.ts` — the percentage, the on/off switch, and `pairSaving`.
- `app/components/BundleOffer.tsx` — the product page box.
- `app/components/CartSummary.tsx` — sums the lines' `discountAllocations`,
  which is what Shopify says it took off, and only then says "offer applied".
- `app/routes/cart.tsx` — attaches the code when there is one, inside a
  `try/catch` so a missing or rejected code can never fail an add to cart.

## Safety

Adding the lines is the part that must never fail — it is the sale. The
(normally dormant) code path is wrapped in a `try/catch`. The `CustomBundleAdd`
cart action also stays registered when the offer is off, so a browser holding a
cached page from when it was on still adds to cart normally.
