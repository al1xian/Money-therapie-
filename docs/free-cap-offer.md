# Free cap offer — buy the piece, get the cap free

The product page shows the cap at **free** inside the "limited offer" box, and
the storefront applies the discount to the cart automatically when the set is
added, so it carries through to checkout.

One thing has to exist on the Shopify side for the price to actually be zero:
**a discount using the code `FREECAP`**. A storefront cannot change a price —
what the customer pays is decided by Shopify at cart and checkout. The code
does everything else.

> Until that discount exists, the cap is added to the cart at its normal price
> while the page says it is free. Create it before pushing the offer.

## Create the discount (once, ~2 minutes)

1. Open **admin.shopify.com** → your store → **Discounts**.
2. **Create discount** → **Buy X get Y**.
3. **Method**: *Discount code*. Type the code exactly: `FREECAP`
   (uppercase, no spaces).
4. **Customer buys**: *Minimum quantity of items* → `1` → **Specific
   products** → pick the piece(s) the offer applies to. Choosing a whole
   collection is fine too.
5. **Customer gets**: quantity `1` → **Specific products** → pick the cap.
6. **At a discounted value**: choose **Free**.
7. **Maximum discount uses**: tick *Limit to one use per order* so a customer
   cannot stack several free caps in one basket.
8. Leave *Combinations* as you prefer, set the active dates, and **Save**.

That is all. The next time someone clicks **add set to cart**, the code is
attached to their cart and the cap drops to zero, in the cart and at checkout.

## How the storefront applies it

- `app/lib/offers.ts` holds the code and the on/off switch.
- `app/routes/cart.tsx` handles a custom `CustomBundleAdd` cart action: it adds
  the two lines, then applies the code — in a single request, so the two cart
  mutations stay sequential (two concurrent writes to the same cart can
  conflict).
- `app/components/BundleOffer.tsx` renders the cap as **free**, strikes through
  the full total, and submits through that action.

## Turning the offer off

Set the code to an empty string in `app/lib/offers.ts`:

```ts
export const FREE_CAP_DISCOUNT_CODE = '';
```

The box then shows the cap at its real price, the set total goes back to the
sum of both items, and no discount code is applied. Nothing else to change.

## Changing the code

Rename it in Shopify **and** in `app/lib/offers.ts` — the two must match
exactly, including case.
