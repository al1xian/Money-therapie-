# Free cap offer — buy the piece, get the cap free

**The offer is currently OFF.** The cap shows at its real price and no discount
code is applied. Turning it on is a one-line change, but do it *after* the
Shopify discount exists — see below.

When on, the product page shows the cap at **free** inside the "limited offer"
box, and the storefront applies the discount to the cart when the set is added,
so it carries through to checkout.

A storefront cannot change a price — what the customer pays is decided by
Shopify at cart and checkout. So the offer needs **a discount using the code
`FREECAP`** to exist in Shopify. The code does everything else.

> Switching the offer on before that discount exists has two costs: the page
> promises a free cap the cart will charge for, and every "add set to cart"
> fires a second cart mutation that can only fail — on the one path where a
> failure costs a sale.

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

## Then switch the offer on

In `app/lib/offers.ts`:

```ts
export const FREE_CAP_DISCOUNT_CODE: string = 'FREECAP';
```

The next time someone clicks **add set to cart**, the code is attached to their
cart and the cap drops to zero, in the cart and at checkout.

Test the whole path once before announcing the offer: add the set, check the
code appears in the cart, and confirm the cap is at 0 on the checkout page.

## How the storefront applies it

- `app/lib/offers.ts` holds the code and the on/off switch.
- `app/routes/cart.tsx` handles a custom `CustomBundleAdd` cart action: it adds
  the two lines, then applies the code — in a single request, so the two cart
  mutations stay sequential (two concurrent writes to the same cart can
  conflict).
- `app/components/BundleOffer.tsx` renders the cap as **free**, strikes through
  the full total, and submits through that action.

## Turning the offer off

Set the code back to an empty string in `app/lib/offers.ts`:

```ts
export const FREE_CAP_DISCOUNT_CODE: string = '';
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
