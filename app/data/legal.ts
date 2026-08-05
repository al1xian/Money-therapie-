/**
 * The storefront's legal and service documents.
 *
 * Held here rather than in Shopify Admin's policy editor for two reasons: they
 * are versioned with the code, and Shopify has no slot at all for a French
 * *mentions légales*, which is a legal requirement for a site selling into
 * France. The Admin policies still exist and are what Shopify's own checkout
 * links to — keep the two in step (see docs/legal-pages.md).
 *
 * Every blank marked with ⚠ has to be filled in with the company's real
 * details before this goes anywhere near a customer. They are deliberately
 * left as visible placeholders: a plausible-looking invented SIREN or address
 * would be worse than an obvious gap, because nobody would notice it.
 */

export type LegalSection = {
  heading: string;
  /** Paragraphs. Plain strings — no markup, no HTML injection. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  list?: string[];
};

export type LegalDocument = {
  handle: string;
  /** Shown in the page title and the header. */
  title: string;
  /** One line under the title. */
  intro: string;
  /** Menu label — shorter than the title. */
  navLabel: string;
  updated: string;
  sections: LegalSection[];
};

/** Anything still carrying this needs the company's real details. */
export const PLACEHOLDER = '⚠ to be completed';

const COMPANY = `⚠ to be completed — registered company name`;
const ADDRESS = `⚠ to be completed — registered address`;
const REGISTRATION = `⚠ to be completed — SIREN / company registration number`;
const VAT = `⚠ to be completed — intra-community VAT number`;
const DIRECTOR = `⚠ to be completed — name of the publication director`;
const SUPPORT_EMAIL = `⚠ to be completed — support email address`;

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    handle: 'terms',
    title: 'terms & conditions',
    navLabel: 'terms & conditions',
    intro:
      'The terms on which reda studio sells to you, and the rules for using this site.',
    updated: 'August 2026',
    sections: [
      {
        heading: '1. who we are',
        body: [
          `This site is operated by ${COMPANY}, registered at ${ADDRESS} under ${REGISTRATION}, VAT ${VAT}. Throughout these terms, "we", "us" and "reda studio" refer to that company, and "you" refers to the person placing an order or browsing the site.`,
          `These terms apply to every order placed through this store. Placing an order means you accept them, so please read them before you buy. We may change them at any time; the version that governs your order is the one published when you place it.`,
        ],
      },
      {
        heading: '2. the products',
        body: [
          `We describe and photograph each piece as accurately as we can. Screens render colour differently, so a small variation between the photograph and the garment is normal and is not a defect.`,
          `Our pieces are produced in limited runs. Availability shown on the site is indicative: if an item sells out between your order and its preparation, we will tell you and refund that item in full.`,
        ],
      },
      {
        heading: '3. prices',
        body: [
          `Prices are shown in euros, inclusive of French VAT. Shipping is calculated at checkout and shown before you pay, so the total you confirm is the total you are charged.`,
          `We may change prices at any time. The price that applies to your order is the one displayed at the moment you confirm it.`,
          `If an item is listed at an obviously incorrect price — a decimal in the wrong place, a €10 overshirt — we may cancel the order and refund you in full rather than fulfil it. We will contact you first.`,
        ],
      },
      {
        heading: '4. placing an order',
        body: [
          `You place an order by adding items to your cart and completing checkout. Your order is an offer to buy; the contract is formed when we send you a confirmation email.`,
          `We may refuse an order where the item is unavailable, where we cannot obtain payment authorisation, where we suspect fraud, or where a resale pattern suggests the order is not for personal use.`,
        ],
      },
      {
        heading: '5. payment',
        body: [
          `Payment is taken at the time of the order, through Shopify Payments and the methods shown at checkout. Card details are handled by the payment provider and never reach our servers.`,
          `Your order is prepared once payment is confirmed.`,
        ],
      },
      {
        heading: '6. delivery',
        body: [
          `Shipping times, costs and territories are set out in our Shipping Policy, which forms part of these terms.`,
          `Risk in the goods passes to you on delivery.`,
        ],
      },
      {
        heading: '7. right of withdrawal and returns',
        body: [
          `If you are a consumer in the European Union, you have a statutory right to withdraw from your purchase within fourteen days of receiving it, without giving a reason. We extend this to thirty days as a commercial gesture.`,
          `How to exercise it, and what happens to your refund, are set out in our Return & Refund Policy, which forms part of these terms. Nothing in that policy reduces your statutory rights.`,
        ],
      },
      {
        heading: '8. legal guarantees',
        body: [
          `Beyond anything we offer commercially, you benefit from the legal guarantee of conformity (articles L.217-3 and following of the French Consumer Code) and the guarantee against hidden defects (articles 1641 and following of the Civil Code).`,
          `Under the guarantee of conformity you have two years from delivery to act, and you may choose between repair and replacement. You do not have to prove the defect existed at delivery during the first two years.`,
        ],
      },
      {
        heading: '9. intellectual property',
        body: [
          `Everything on this site — the name, the logo, the photographs, the garment designs, the texts and the code — belongs to reda studio or is used with permission. You may not copy, reproduce or reuse it commercially without our written agreement.`,
          `Buying a garment gives you the garment. It does not give you a licence to reproduce its design.`,
        ],
      },
      {
        heading: '10. your use of the site',
        body: [
          `You agree not to attempt to disrupt the site, to access data you are not entitled to, to scrape it at a scale that degrades it for others, or to use it for anything unlawful.`,
        ],
      },
      {
        heading: '11. liability',
        body: [
          `We are liable for foreseeable loss caused by our failure to meet these terms. We are not liable for loss that was not foreseeable, nor for business losses, since our products are sold for personal use.`,
          `Nothing here limits our liability for death or personal injury caused by our negligence, for fraud, or for anything that cannot lawfully be limited.`,
        ],
      },
      {
        heading: '12. complaints and disputes',
        body: [
          `Write to us first at ${SUPPORT_EMAIL}. Most things are settled that way.`,
          `If we cannot agree, you may use the European Commission's online dispute resolution platform at ec.europa.eu/consumers/odr, or refer the matter to a consumer mediator, free of charge to you.`,
          `These terms are governed by French law. If you are a consumer, you keep the protection of the mandatory rules of the country where you live.`,
        ],
      },
    ],
  },

  {
    handle: 'shipping',
    title: 'shipping policy',
    navLabel: 'shipping',
    intro: 'How and when your order reaches you.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'processing',
        body: [
          `We process and ship all orders within one to three business days. Orders placed at the weekend or on a public holiday are prepared on the next business day.`,
          `During drops and sale periods, preparation can take slightly longer. If it does, we say so on the site rather than letting you find out from a tracking page that has not moved.`,
        ],
      },
      {
        heading: 'delivery times',
        body: [
          `Once your parcel leaves us, expect:`,
        ],
        list: [
          'France — 48 hours, tracked',
          'Belgium, Luxembourg, Germany, Spain, Italy, Netherlands — 3 to 5 business days',
          'Rest of the European Union — 4 to 7 business days',
          'Rest of the world — 7 to 14 business days',
        ],
      },
      {
        heading: 'shipping costs',
        body: [
          `Shipping is calculated at checkout from the destination and the weight of the parcel, and shown in full before you pay.`,
          `Shipping is free on orders over €150 delivered within France.`,
        ],
      },
      {
        heading: 'tracking',
        body: [
          `Every parcel is tracked. You receive a tracking number by email as soon as the label is created, and you can follow the parcel at any time from our order tracking page.`,
          `A tracking number can take a few hours to become active with the carrier. If it shows nothing at first, that is normal.`,
        ],
      },
      {
        heading: 'customs and import duties',
        body: [
          `Orders shipped outside the European Union may attract import duties and taxes on arrival. These are set by the destination country, are payable by you, and are not included in what you paid us.`,
          `We cannot declare an order as a gift or under-declare its value. We do not do it, and being asked does not change the answer.`,
        ],
      },
      {
        heading: 'wrong address, failed delivery',
        body: [
          `Please check your address before confirming. We can correct it only while the order is still being prepared — write to us immediately at ${SUPPORT_EMAIL}.`,
          `If a parcel comes back to us because the address was wrong or nobody collected it, we will refund the items but not the original shipping, and reshipping is at your cost.`,
        ],
      },
      {
        heading: 'lost or damaged parcels',
        body: [
          `If tracking has not moved for seven business days, or the parcel arrives damaged, contact us. We open a claim with the carrier and either reship or refund you — we do not leave you to argue with the carrier yourself.`,
        ],
      },
    ],
  },

  {
    handle: 'returns',
    title: 'return & refund policy',
    navLabel: 'returns & refunds',
    intro: 'Thirty days to change your mind, and what happens next.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'the window',
        body: [
          `You have thirty days from the day you receive your order to return it. That is longer than the fourteen days EU law requires, and it does not replace your statutory rights — it adds to them.`,
        ],
      },
      {
        heading: 'condition',
        body: [
          `Pieces must come back unworn, unwashed, with their tags attached and in their original packaging. Trying something on is fine; wearing it out is not.`,
          `We reserve the right to refuse a return that arrives visibly worn, marked, or smelling of smoke or perfume, and to send it back to you.`,
        ],
      },
      {
        heading: 'what cannot be returned',
        body: [
          `For hygiene reasons, underwear and socks cannot be returned once the seal is broken. Gift cards are not refundable. Anything made or altered to your specification is not returnable.`,
        ],
      },
      {
        heading: 'how to return',
        body: [
          `Write to us at ${SUPPORT_EMAIL} with your order number and what you are sending back. We reply with the return address and instructions within one business day.`,
          `Return shipping is at your cost unless the item is faulty or we sent the wrong one, in which case we cover it. Use a tracked service — until the parcel reaches us, it is your responsibility.`,
        ],
      },
      {
        heading: 'refunds',
        body: [
          `We inspect the return and refund you within fourteen days of receiving it, to the payment method you used. Your bank may take a few more days to show it.`,
          `We refund the price of the items and the standard outbound shipping. If you chose an express option, we refund the standard rate, not the difference.`,
          `Where an order was discounted as a set — the cap offer, for instance — returning part of it removes the discount from the part you keep, and the refund is adjusted accordingly.`,
        ],
      },
      {
        heading: 'exchanges',
        body: [
          `The fastest route is to return the item for a refund and place a new order for the size or colour you want. It avoids your size selling out while a parcel is in transit.`,
          `If you would rather we handled the exchange directly, ask and we will, subject to stock.`,
        ],
      },
      {
        heading: 'faulty items',
        body: [
          `If something arrives faulty or is not what you ordered, tell us within a reasonable time and send a photograph. We cover return shipping and either replace the item or refund you in full, as you prefer.`,
          `This is on top of the legal guarantee of conformity and the guarantee against hidden defects described in our terms.`,
        ],
      },
    ],
  },

  {
    handle: 'privacy',
    title: 'privacy policy',
    navLabel: 'privacy',
    intro: 'What we collect, why, and what you can ask us to do about it.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'who is responsible',
        body: [
          `${COMPANY}, ${ADDRESS}, is the data controller for the personal data collected through this site. For any question about your data, write to ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        heading: 'what we collect',
        body: [`We collect only what an order or a request actually needs:`],
        list: [
          'Identity and contact details — name, email, postal address, phone number',
          'Order details — what you bought, when, for how much, and where it was sent',
          'Payment confirmation — never the card number itself, which stays with our payment provider',
          'Newsletter subscription, if you asked for it',
          'Technical data — IP address, browser, pages visited, through our analytics',
        ],
      },
      {
        heading: 'why we use it, and on what legal basis',
        body: [
          `To fulfil your order and provide support: because we have a contract with you.`,
          `To send you marketing emails: because you consented, and only until you withdraw it.`,
          `To keep accounting and invoicing records: because the law requires it.`,
          `To secure the site and understand how it is used: because we have a legitimate interest in it working and not being abused.`,
        ],
      },
      {
        heading: 'who sees it',
        body: [
          `Our processors, and nobody else. Shopify hosts the store and processes orders; our payment provider handles payment; our carriers deliver the parcel; our email provider sends the newsletter.`,
          `We do not sell your data. We do not rent it. We do not trade it for reach.`,
          `Some of these providers operate outside the European Union. Where they do, transfers are covered by the European Commission's standard contractual clauses.`,
        ],
      },
      {
        heading: 'how long we keep it',
        body: [
          `Order and invoice data: ten years, as French commercial law requires.`,
          `Customer account data: for as long as the account is open, then three years after your last contact with us.`,
          `Newsletter data: until you unsubscribe, then we delete it.`,
          `Analytics data: thirteen months.`,
        ],
      },
      {
        heading: 'your rights',
        body: [
          `Under the GDPR you can ask us to give you a copy of your data, correct it, delete it, restrict what we do with it, or send it to another provider. You can object to processing based on legitimate interest, and withdraw consent for marketing at any time — every email has an unsubscribe link.`,
          `Write to ${SUPPORT_EMAIL}. We answer within one month. If you are not satisfied, you can complain to the CNIL at cnil.fr.`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `We use cookies that are strictly necessary for the site to work — your cart and your session — which do not require consent. Analytics cookies are only set if you accept them, and you can change your mind at any time from your browser settings.`,
          `The newsletter pop-up records that it has been shown, in your browser only. That record never leaves your device and tells us nothing about you.`,
        ],
      },
    ],
  },

  {
    handle: 'legal-notice',
    title: 'legal notice',
    navLabel: 'legal notice',
    intro: 'Publisher, host and contact details, as required by French law.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'site publisher',
        body: [
          `${COMPANY}`,
          `Registered address: ${ADDRESS}`,
          `Registration: ${REGISTRATION}`,
          `Intra-community VAT: ${VAT}`,
          `Contact: ${SUPPORT_EMAIL}`,
        ],
      },
      {
        heading: 'publication director',
        body: [DIRECTOR],
      },
      {
        heading: 'hosting',
        body: [
          `This site is hosted on Shopify Oxygen by Shopify International Limited, Victoria Buildings, 1–2 Haddington Road, Dublin 4, D04 XN32, Ireland.`,
        ],
      },
      {
        heading: 'intellectual property',
        body: [
          `The whole of this site — its structure, texts, photographs, logos and garment designs — is protected by intellectual property law and belongs to reda studio unless stated otherwise. Any reproduction without written permission is prohibited.`,
        ],
      },
      {
        heading: 'personal data',
        body: [
          `How we handle personal data is set out in full in our Privacy Policy.`,
        ],
      },
      {
        heading: 'mediation and online dispute resolution',
        body: [
          `In accordance with article L.612-1 of the French Consumer Code, you may refer a dispute to a consumer mediator free of charge. The European Commission also provides an online dispute resolution platform at ec.europa.eu/consumers/odr.`,
        ],
      },
    ],
  },
];

/** Lookup by URL handle. */
export function findLegalDocument(handle?: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((document) => document.handle === handle);
}
