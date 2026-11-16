/**
 * Business details – Baked Boscombe, Bournemouth.
 * Sources: client-supplied phone, email and Facebook page (facebook.com/bakedboscombe – needs a login to read);
 * address and food hygiene rating from the Food Standards Agency register (establishment 495038:
 * Baked Boscombe, 43 Palmerston Road, BH1 4HW, rating 5 "Very Good", inspected 30 Nov 2023).
 * Menu and opening hours were NOT available – CONFIRM. Edit here, then `npm run build` and `node flatten.js`.
 */
module.exports = {
  name: 'Baked Boscombe',
  shortName: 'Baked Boscombe',
  brandSub: 'Bakery & Café · Boscombe, Bournemouth',
  lang: 'en-GB',
  locale: 'en_GB',
  phoneFormat: 'UK',
  url: 'https://www.bakedboscombe.co.uk', // placeholder domain – CONFIRM
  area: 'Boscombe, Bournemouth, Southbourne, Springbourne and Pokesdown',
  phone: '07816 151131',
  phoneIntl: '+447816151131',
  phoneHref: 'tel:+447816151131',
  whatsapp: 'https://wa.me/447816151131',
  whatsappNumber: '447816151131',
  address: { street: '43 Palmerston Road, Boscombe', city: 'Bournemouth', region: 'Dorset', postcode: 'BH1 4HW', country: 'GB' },
  addressLine: '43 Palmerston Road, Boscombe, Bournemouth BH1 4HW',
  mapQuery: 'Baked Boscombe, 43 Palmerston Road, Bournemouth BH1 4HW',
  yell: 'https://www.facebook.com/bakedboscombe/',
  reviewSiteName: 'Facebook',
  hours: [],
  openFrom: null, openTo: null,
  hoursShort: '',
  hoursLabel: '',
  openingHoursSchema: '',
  rating: null,
  reviews: [],
  contactName: '',
  schemaType: 'Bakery',
  schemaDescription: 'Independent bakery and café on Palmerston Road, Boscombe, Bournemouth: fresh bread, pastries, cakes, coffee and celebration cakes to order. Food hygiene rating 5 (Very Good).',
  footerAbout: 'An independent bakery and café on Palmerston Road in Boscombe. Fresh bakes, good coffee and cakes made to order.',
  ctaTitle: 'Ordering a cake or a big batch?',
  ctaText: 'Send us a message with the date and what you’d like, and we’ll get back to you.',
  ctaButton: 'Place an order enquiry',
  headerCta: 'Order a cake',
  manifestShort: 'Baked',
  license: '',
  nav: { services: 'Menu', about: 'About', portfolio: 'Gallery' },
  socials: [{ label: 'Baked Boscombe on Facebook', icon: 'facebook', url: 'https://www.facebook.com/bakedboscombe/' }],
  // Orders and enquiries are emailed here via FormSubmit. The FIRST submission sends a one-time activation email – click it once.
  email: 'bakedboscombe@gmail.com',
  formEndpoint: null,
};
if (!module.exports.formEndpoint && module.exports.email) {
  module.exports.formEndpoint = 'https://formsubmit.co/ajax/' + module.exports.email;
}
