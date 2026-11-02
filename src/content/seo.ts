// Search-engine title and description for each public page (English text is the
// translation key). The browser uses the title; worker/index.js writes both into the
// HTML in Spanish so search engines and link previews see them without JavaScript.
export const SEO_PAGES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Florida LLC and corporation formation, EIN and registered agent",
    description: "Form your Florida LLC or corporation, get your EIN and keep a registered agent in Florida. Help in Spanish, English and Portuguese for US and international entrepreneurs.",
  },
  "/start": {
    title: "Start your Florida company",
    description: "Choose your package, enter your company details and pay securely online. We file your Florida LLC or corporation, usually within 1 business day.",
  },
  "/about": {
    title: "About us",
    description: "We help US and international entrepreneurs form a Florida LLC or corporation, get an EIN and keep a registered agent, in Spanish, English and Portuguese.",
  },
  "/contact": {
    title: "Contact us",
    description: "Questions about forming your Florida company? Send us a message and we'll reply by email in Spanish, English or Portuguese.",
  },
  "/blog": {
    title: "Florida business formation guides",
    description: "Practical guides to form and maintain a Florida LLC or corporation, get an EIN and keep a registered agent.",
  },
  "/florida-llc-vs-corporation": {
    title: "Florida LLC vs corporation",
    description: "Compare the ownership and management of a Florida LLC and a corporation before choosing your formation package. General information, not legal advice.",
  },
  "/ein-application": {
    title: "EIN application",
    description: "What an EIN is, who needs one and how we help you apply to the IRS for your Florida LLC or corporation, even without an SSN.",
  },
  "/registered-agent-renewal": {
    title: "Registered agent renewal",
    description: "Florida registered agent service with a Florida address for official mail, included the first year and then $119 per year.",
  },
  "/terms": {
    title: "Terms of Service",
    description: "Terms of service for Florida company formation, EIN, registered agent and website services ordered on agenteregistradofl.com.",
  },
  "/refund-policy": {
    title: "Refund policy",
    description: "When you can get a refund for formation, add-on, registered agent and website services, and how refunds are paid.",
  },
  "/privacy": {
    title: "Privacy policy",
    description: "What information we ask for when you order or contact us, and how it is used to provide our services.",
  },
  "/legal-disclaimer": {
    title: "Legal disclaimer",
    description: "We are not a law firm and do not give legal or tax advice. We provide filing assistance and general information.",
  },
};
