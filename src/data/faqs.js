/**
 * The questions a site engineer or purchaser actually asks before ordering, in
 * the order they tend to ask them: what can I get, when, at what price basis,
 * will someone help me use it, and who am I buying from.
 *
 * Answers are written from the positioning already on the site — local stock,
 * specification support, people who come to site — so the section restates the
 * promise in the buyer's own words rather than adding a new one.
 *
 * NOTE: every number and commitment here needs the client's confirmation before
 * this goes live — lead times, delivery outside Kathmandu, sample policy,
 * minimum order. Don't publish a service promise the business can't keep.
 */
export const faqs = [
  {
    id: 'stock',
    question: 'Do you hold stock in Nepal, or is everything ordered in?',
    answer:
      'The range is held in Kathmandu. Ordering against each job would put an import schedule between you and the pour, so the common products sit in the warehouse and go out against a delivery date rather than a shipping date.',
  },
  {
    id: 'lead-time',
    question: 'How quickly can material reach a site?',
    answer:
      'For stocked lines in the valley, same or next working day once the order is confirmed. Outside the valley depends on the transport leg rather than on us, and we will tell you the honest date when you ask, not the one you want to hear.',
  },
  {
    id: 'specify',
    question: 'Can you tell me which product my pour needs?',
    answer:
      'That is the part of the job we would rather do than sell you a catalogue. Tell us the mix, the substrate, the ambient conditions, and what the element has to survive, and you get a product, a dosage, and the data sheet the recommendation rests on.',
  },
  {
    id: 'documents',
    question: 'What documentation comes with an order?',
    answer:
      'Technical data sheet and the manufacturer batch documentation for what you receive. Thermax products are made under audited management systems, and the certificates sit with the manufacturer — we can put them in front of you when a consultant asks.',
  },
  {
    id: 'site',
    question: 'Will someone come to site for the first application?',
    answer:
      'Yes. Dosage that works on paper still has to work in your batching, your weather, and your labour. Someone is there for the first application and reachable afterwards, because getting the product right on the day is part of supplying it.',
  },
  {
    id: 'trial',
    question: 'Can we trial a product before committing to a job?',
    answer:
      'Trial quantities for a genuine project are usually workable. Tell us the job and the volume it would lead to, and we will say what we can send and what a realistic trial looks like.',
  },
]
