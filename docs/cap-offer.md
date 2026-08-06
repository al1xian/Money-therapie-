# Cap offer — €10 off the cap with any other purchase

The product page's "limited offer" box shows the cap at **€10 off**, with its
full price struck through, and names the code the customer can use: **CAP55**.

A storefront cannot change a price: what the customer pays is decided by
Shopify. So the offer needs a real discount to exist in Shopify, as a
**discount code** spelled exactly `CAP55`.

The customer does not have to type it. The storefront attaches the code to the
cart after every change, so the reduction is already there when they arrive —
the code is shown so they can recognise it, check it, and share it, not so they
have to work for the discount.

> **Until that discount exists, the page announces −€10 that the cart will not
> apply.** Create it before promoting the offer. Nothing breaks in the meantime,
> but the customer is shown a price they will not get.

## Create the discount (once, ~2 minutes)

1. Open **admin.shopify.com** → your store → **Discounts**.
2. **Create discount** → **Buy X get Y**.
3. **Method**: choose **Discount code**, and type the code exactly: `CAP55`
   — uppercase, no spaces. It has to match `app/lib/offers.ts` character for
   character, or the storefront will apply a code Shopify does not know.
4. **Customer buys**: *Minimum quantity of items* → `1` → **Specific
   products** (or a collection) → everything the offer should trigger on. To
   make it "any other product", pick your whole catalogue collection here and
   leave the cap out of it.
5. **Customer gets**: quantity `1` → **Specific products** → the cap.
6. **At a discounted value**: choose **Amount off each** and enter `10`.
7. **Maximum discount uses**: tick *Limit to one use per order*, so a customer
   cannot stack several discounted caps in one basket.
8. Set the active dates and **Save**.

Test the path once before promoting it: add any product plus the cap, check the
code appears in the cart on its own, and confirm the cap is €10 cheaper at
checkout. Then remove it and type `CAP55` in by hand, to confirm that route
works too.

## What a code costs you

Worth knowing, because it is the trade-off you accepted by asking for one: a
code travels. Once it is on the site it will be posted to voucher aggregators,
and anyone who has it can try it on any basket. Shopify's conditions still
decide whether it applies, so it cannot be used on the wrong products — but it
can be used by people you never sent it to, and it cannot be taken back without
deactivating it for everybody.

If that becomes a problem, switch to an **Automatic discount** in Shopify and
set `CAP_DISCOUNT_CODE` to an empty string. The offer then works on the
conditions alone, with nothing to share, and the storefront stops applying
anything.

## How the storefront reads it

- `app/lib/offers.ts` holds the amount and the on/off switch.
- `app/components/BundleOffer.tsx` shows the reduced cap price and strikes
  through the full one.
- `app/routes/cart.tsx` attaches the code after every line change, inside a
  `try/catch` so a missing or rejected code can never fail the add to cart.
- `app/components/CartSummary.tsx` sums the cart lines' `discountAllocations` —
  what Shopify says it actually took off — and only then says "offer applied".
  With nothing allocated it names the code instead. It never announces a
  reduction the customer has not been given.

## Changing the amount

The code's name says nothing about the amount — `CAP55` takes off whatever the
Shopify discount says it does. Change it in Shopify **and** in
`app/lib/offers.ts`:

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

## Changing or retiring the code

Rename it in Shopify **and** in `app/lib/offers.ts` — the two must match
exactly, including case. Emptying it there switches the storefront back to
expecting an automatic discount, and it stops applying anything itself.

Never run a code and an automatic discount for the same offer at once, or the
reductions stack.

## Safety

Adding the lines to the cart is the part that must never fail — it is the sale.
The (normally dormant) code path is wrapped in a `try/catch`, so a missing,
expired or rejected code cannot take the cart mutation down with it. The
`CustomBundleAdd` cart action also stays registered when the offer is off, so a
browser holding a cached page from when it was on still adds to cart normally.
