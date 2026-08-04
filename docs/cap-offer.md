# Cap offer — €10 off the cap with any other purchase

The product page's "limited offer" box shows the cap at **€10 off**, with its
full price struck through, and the storefront applies the discount to the cart
when the set is added, so it carries through to checkout.

A storefront cannot change a price — what the customer pays is decided by
Shopify at cart and checkout. So the offer needs **a discount using the code
`CAP10`** to exist in Shopify. The code does everything else.

> **Until that discount exists, the page announces −€10 that the cart will not
> apply.** Create it before promoting the offer. Nothing breaks in the meantime
> — the discount step cannot fail the add to cart, see *Safety* below — but the
> customer is shown a price they will not get.

## Create the discount (once, ~2 minutes)

1. Open **admin.shopify.com** → your store → **Discounts**.
2. **Create discount** → **Buy X get Y**.
3. **Method**: *Discount code*. Type the code exactly: `CAP10`
   (uppercase, no spaces).
4. **Customer buys**: *Minimum quantity of items* → `1` → **Specific
   products** (or a collection) → everything the offer should trigger on. To
   make it "any other product", pick your whole catalogue collection here and
   leave the cap out of it.
5. **Customer gets**: quantity `1` → **Specific products** → the cap.
6. **At a discounted value**: choose **Amount off each** and enter `10`.
7. **Maximum discount uses**: tick *Limit to one use per order*, so a customer
   cannot stack several discounted caps in one basket.
8. Set the active dates and **Save**.

Test the path once before promoting it: add the set, check the code appears in
the cart, and confirm the cap is €10 cheaper at checkout.

## How the storefront applies it

- `app/lib/offers.ts` holds the code, the amount, and the on/off switch.
- `app/routes/cart.tsx` handles a custom `CustomBundleAdd` cart action: it adds
  the two lines, then applies the code — in a single request, so the two cart
  mutations stay sequential (two concurrent writes to the same cart can
  conflict).
- `app/components/BundleOffer.tsx` shows the reduced cap price, strikes through
  the full one, and submits through that action.

## Changing the amount

Change it in Shopify **and** in `app/lib/offers.ts`:

```ts
export const CAP_DISCOUNT_AMOUNT = 10;
```

The storefront only uses this figure to display the reduced price; the real
reduction is the one configured in Shopify. If the two disagree, the customer
sees one price and pays another — keep them in step.

The displayed reduction is capped at the cap's own price, so a cap cheaper than
the discount never shows a negative amount.

## Turning the offer off

Set the code to an empty string in `app/lib/offers.ts`:

```ts
export const CAP_DISCOUNT_CODE: string = '';
```

The box then shows the cap at its real price, the set total goes back to the
sum of both items, and no discount code is applied. Nothing else to change.

## Safety

Adding the lines is the part that must never fail — it is the sale. The
discount is applied inside a `try/catch`, so a missing, expired or rejected
code cannot take the cart mutation down with it: the customer still gets the
items and can still check out. The `CustomBundleAdd` cart action also stays
registered when the offer is off, so a browser holding a cached page from when
it was on still adds to cart normally.

## Changing the code

Rename it in Shopify **and** in `app/lib/offers.ts` — the two must match
exactly, including case.
