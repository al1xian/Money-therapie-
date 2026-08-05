# Cap offer — €10 off the cap with any other purchase

The product page's "limited offer" box shows the cap at **€10 off**, with its
full price struck through. The reduction then appears in the cart and at
checkout **on its own** — the customer never types a discount code.

A storefront cannot change a price: what the customer pays is decided by
Shopify. So the offer needs a real discount to exist in Shopify, and it has to
be an **automatic discount** — the kind Shopify evaluates against the basket
itself, with no code attached.

> **Until that discount exists, the page announces −€10 that the cart will not
> apply.** Create it before promoting the offer. Nothing breaks in the meantime,
> but the customer is shown a price they will not get.

## Create the discount (once, ~2 minutes)

1. Open **admin.shopify.com** → your store → **Discounts**.
2. **Create discount** → **Buy X get Y**.
3. **Method**: choose **Automatic discount** — *not* "Discount code". This is
   the step that makes it code-free; everything else follows from it.
4. **Title**: something the customer will recognise on their receipt, e.g.
   `Cap offer — €10 off`. Automatic discount titles are shown to customers.
5. **Customer buys**: *Minimum quantity of items* → `1` → **Specific
   products** (or a collection) → everything the offer should trigger on. To
   make it "any other product", pick your whole catalogue collection here and
   leave the cap out of it.
6. **Customer gets**: quantity `1` → **Specific products** → the cap.
7. **At a discounted value**: choose **Amount off each** and enter `10`.
8. **Maximum discount uses**: tick *Limit to one use per order*, so a customer
   cannot stack several discounted caps in one basket.
9. Set the active dates and **Save**.

Test the path once before promoting it: add any product plus the cap, and check
the reduction shows in the cart and is still there at checkout — without
entering anything.

## Why automatic rather than a code

A code has to reach the customer, and every route there leaks: it gets shared,
mistyped, or applied to orders it was never meant for. An automatic discount is
attached to the *conditions*, not to a string. It also takes the storefront out
of the loop — there is no code to apply after each cart mutation, so there is no
request that can fail and no state that can drift out of sync with what Shopify
thinks the basket is worth.

## How the storefront reads it

- `app/lib/offers.ts` holds the amount and the on/off switch.
- `app/components/BundleOffer.tsx` shows the reduced cap price and strikes
  through the full one.
- `app/components/CartSummary.tsx` sums the cart lines' `discountAllocations` —
  what Shopify says it actually took off — and only then says "offer applied".
  With nothing allocated it stays an invitation. It never announces a reduction
  the customer has not been given.

## Changing the amount

Change it in Shopify **and** in `app/lib/offers.ts`:

```ts
export const CAP_DISCOUNT_AMOUNT = 10;
```

The storefront only uses this figure to display the reduced price on the
product page; the real reduction is the one configured in Shopify. If the two
disagree, the customer sees one price and pays another — keep them in step.
(The cart note doesn't use it once the discount is live: it reports Shopify's
own figure.)

The displayed reduction is capped at the cap's own price, so a cap cheaper than
the discount never shows a negative amount.

## Turning the offer off

Set the switch in `app/lib/offers.ts`:

```ts
export const CAP_OFFER_ENABLED = false;
```

The box then shows the cap at its real price, the set total goes back to the
sum of both items, and the cart note disappears. Deactivate the discount in
Shopify too, or it will keep applying.

## If the offer ever has to be a code again

`app/lib/offers.ts` keeps an escape hatch:

```ts
export const CAP_DISCOUNT_CODE: string = '';
```

Put a code there and `app/routes/cart.tsx` goes back to attaching it to the
cart after every line change. Empty — the default — the storefront applies
nothing and relies entirely on the automatic discount. Don't run both at once,
or the reductions stack.

## Safety

Adding the lines to the cart is the part that must never fail — it is the sale.
The (normally dormant) code path is wrapped in a `try/catch`, so a missing,
expired or rejected code cannot take the cart mutation down with it. The
`CustomBundleAdd` cart action also stays registered when the offer is off, so a
browser holding a cached page from when it was on still adds to cart normally.
