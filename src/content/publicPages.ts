export type PublicPageKey = "legal-disclaimer" | "privacy" | "florida-llc-vs-corporation" | "ein-application" | "registered-agent-renewal" | "terms" | "refund-policy";
export const publicPages = {
  "legal-disclaimer": {
    "title": "Legal disclaimer",
    "intro": "Florida Registered Agent is operated by Diler Services, LLC. Our services provide administrative filing assistance and general information.",
    "sections": [
      {
        "title": "Not legal or tax advice",
        "paragraphs": [
          "We are not a law firm. Website content, document templates, operating agreements and AI recommendations are not legal or tax advice and do not create an attorney-client relationship. Consult a licensed attorney or CPA about your circumstances."
        ]
      },
      {
        "title": "Your decisions and filings",
        "paragraphs": [
          "You are responsible for choosing an entity, providing accurate information and meeting applicable filing, licensing and tax obligations. Formation alone does not grant business licenses, immigration status or permission to work in the United States."
        ]
      },
      {
        "title": "Government decisions and timing",
        "paragraphs": [
          "Sunbiz and the IRS control approval and processing times. We do not guarantee name availability, filing approval, EIN issuance, bank account approval or a particular tax result. Government fees are separate from service fees unless expressly included in your order."
        ]
      },
      {
        "title": "Independent professionals",
        "paragraphs": [
          "We can refer you to partner CPAs and attorneys. Their professional advice and engagements are separate from our administrative services. An AI recommendation is general information and should be reviewed with a qualified professional."
        ]
      }
    ],
    "actions": [],
    "draft": false
  },
  "privacy": {
    "title": "Privacy policy",
    "intro": "Diler Services, LLC operates Florida Registered Agent. This draft notice describes the information requested by the website; final privacy practices and contact details are pending confirmation.",
    "sections": [
      {
        "title": "Information you provide",
        "paragraphs": [
          "The order form requests company names, business purpose, owner names and ownership percentages, contact name, email, phone, country and mailing address. The contact form receives the information you submit. Please do not enter Social Security numbers, passport details, card numbers or confidential documents in the contact form or AI advisor."
        ]
      },
      {
        "title": "Orders, payments and AI",
        "paragraphs": [
          "Order information is used to prepare requested services and communicate about your order. When Stripe payments are connected, Stripe processes checkout information under its own privacy policy. Descriptions submitted to the AI advisor are sent to Lovable AI Gateway for a recommendation. Avoid sensitive information in those descriptions.",
          "When you authorize a filing at checkout, we save your typed name, the date and time, your IP address and browser type as a record of your authorization. We never ask for Social Security numbers or ITINs on the website; if one is needed for an EIN application, we get it from you by phone and do not store it."
        ]
      },
      {
        "title": "Public records and referrals",
        "paragraphs": [
          "Information included in Florida filings may become public through Sunbiz. Registered agent service does not make all company information private. Any sharing of client details with partner professionals, including the permission process, must be confirmed before this policy is finalized."
        ]
      },
      {
        "title": "Preferences, advertising and retention",
        "paragraphs": [
          "The site saves your selected language in browser storage. Advertising trackers, analytics, retention periods and deletion procedures have not yet been confirmed by the business owner. This draft does not claim a specific retention period or that personal information is never shared or sold."
        ]
      },
      {
        "title": "Privacy questions",
        "paragraphs": [
          "Use our contact page for privacy questions without submitting sensitive information. A dedicated privacy email, business mailing address and final rights-request process must be added before treating this notice as a finalized policy."
        ]
      }
    ],
    "actions": [
      {
        "label": "Privacy contact",
        "href": "/contact"
      }
    ],
    "draft": true
  },
  "florida-llc-vs-corporation": {
    "title": "Florida LLC vs corporation",
    "intro": "Compare ownership and management structures before choosing your Florida formation package. Entity choice and tax treatment are different decisions.",
    "sections": [
      {
        "title": "LLC: members and flexible management",
        "paragraphs": [
          "An LLC has members and may be member-managed or manager-managed. An operating agreement sets out internal arrangements. Liability protection has limits and depends on the facts; it is not a guarantee against personal liability."
        ]
      },
      {
        "title": "Corporation: shareholders and directors",
        "paragraphs": [
          "A corporation has shareholders, a board of directors and officers. Bylaws govern internal operations. Issuing shares and corporate formalities may fit some investment plans, but an attorney should review fundraising and ownership arrangements."
        ]
      },
      {
        "title": "Tax classification is separate",
        "paragraphs": [
          "An S corporation is a federal tax election, not a separate Florida formation type. Eligibility restrictions apply, including restrictions on nonresident alien shareholders. A CPA can explain federal, state and international reporting obligations before you choose."
        ]
      },
      {
        "title": "Formation is only the beginning",
        "paragraphs": [
          "Both structures need a Florida registered agent and ongoing state filings. Licenses, taxes and other obligations depend on your activities. Our formation assistance is administrative, not legal or tax advice."
        ]
      }
    ],
    "actions": [
      {
        "label": "Form an LLC",
        "href": "/start?entity=llc"
      },
      {
        "label": "Form a corporation",
        "href": "/start?entity=corp"
      }
    ],
    "draft": false
  },
  "ein-application": {
    "title": "EIN application",
    "intro": "An Employer Identification Number identifies your business for federal tax purposes. It does not replace formation, licenses or tax filings.",
    "sections": [
      {
        "title": "Apply directly or request assistance",
        "paragraphs": [
          "The IRS issues EINs free of charge. Our fee, when selected, is for application assistance, not a government EIN fee. For a new company, review the Professional package or the EIN add-on during formation checkout."
        ]
      },
      {
        "title": "Information needed for the application",
        "paragraphs": [
          "The IRS generally requests the legal business name, entity details, address, responsible party and reason for applying. Required identification depends on the application method and circumstances. Do not submit SSNs or identity documents through our general contact form or AI advisor."
        ]
      },
      {
        "title": "International applicants",
        "paragraphs": [
          "The IRS online application has eligibility restrictions. International applicants may need Form SS-4 and a different submission method. Processing time varies; we do not guarantee immediate issuance or a bank account."
        ]
      }
    ],
    "actions": [
      {
        "label": "Form a company with EIN assistance",
        "href": "/start?plan=professional"
      },
      {
        "label": "EIN for an existing company",
        "href": "/contact"
      }
    ],
    "draft": false
  },
  "registered-agent-renewal": {
    "title": "Registered agent renewal",
    "intro": "Keep a registered agent on record for your Florida company. Renewing agent service and filing your annual report are separate tasks.",
    "sections": [
      {
        "title": "What a registered agent does",
        "paragraphs": [
          "A registered agent receives service of process and official notices at a Florida street address. The agent must accept the appointment. An agent address is not automatically a business office, mailing service or a substitute for every address required in public filings."
        ]
      },
      {
        "title": "Renewal for an existing company",
        "paragraphs": [
          "Renewals are handled as one-time service requests, not automatic subscriptions. Contact us with your company name and Sunbiz document number to confirm your current service period, renewal terms and price before paying. Do not place a new formation order to renew an existing company."
        ]
      },
      {
        "title": "Changing your agent",
        "paragraphs": [
          "If your agent or registered office changes, the state record must be updated using the applicable Sunbiz filing. Paying an agent service fee alone does not update Sunbiz or file an annual report. Review the state record and confirm the required filing with us."
        ]
      }
    ],
    "actions": [
      {
        "label": "Request agent renewal",
        "href": "/contact"
      }
    ],
    "draft": false
  },
  "terms": {
    "title": "Terms of Service",
    "intro": "These terms apply to services ordered on agenteregistradofl.com from Diler Services, LLC, which operates Florida Registered Agent (\"we\", \"us\"). By placing an order you agree to these terms and to our Refund policy.",
    "updated": "Updated October 26, 2026",
    "sections": [
      {
        "title": "Our services",
        "paragraphs": [
          "We provide administrative assistance with Florida business filings: preparing and submitting formation documents, registered agent service, EIN application assistance, annual report filing and the other services described in your order. We are not a law firm and do not give legal, tax or immigration advice."
        ]
      },
      {
        "title": "Your responsibilities",
        "paragraphs": [
          "You must give us accurate and complete information and keep it up to date. You authorize us to prepare and submit filings on your behalf using the information you provide. You remain responsible for your company's licenses, taxes and other legal obligations."
        ]
      },
      {
        "title": "Prices and payment",
        "paragraphs": [
          "Prices are shown before you pay and include our service fee plus the Florida state filing fee listed at checkout. Some services carry additional state fees, marked \"+ state fee\", which we charge when that service is used. Payments are processed by Stripe. Sales tax, if any, is shown at checkout."
        ]
      },
      {
        "title": "Timing and government decisions",
        "paragraphs": [
          "We usually submit filings within 1 business day after receiving complete information, or the same day for expedited orders. The State of Florida and the IRS decide approval and processing times. We do not guarantee approval, name availability, EIN issuance, bank account approval or any particular result."
        ]
      },
      {
        "title": "Registered agent service",
        "paragraphs": [
          "When registered agent service is included, we act as your Florida registered agent for the period stated in your order. We receive service of process and official notices at our Florida street address and forward them to the contact information you give us; keep it current. Renewal after the first year is $119 per year and is not charged automatically. If you do not renew, we may resign as your registered agent as permitted by Florida law, after notifying you."
        ]
      },
      {
        "title": "Documents and templates",
        "paragraphs": [
          "Operating agreements and bylaws are standard templates completed with the information you provide. They are not customized legal documents or legal advice; consider having an attorney review them."
        ]
      },
      {
        "title": "Website services",
        "paragraphs": [
          "The Business + Website package includes a 7-page website in Spanish and English, 2 rounds of revisions, Google Business Profile setup and business email setup. We deliver the website within 21 business days after we receive the content we request from you (logo, photos, texts and business details). Delays in sending content or feedback extend the delivery date.",
          "Changes beyond the 2 included revision rounds, additional pages and new features are quoted separately. Domain registration and email service are paid to their providers and are registered in your name.",
          "Keeping the website online requires our care plan ($29 per month, starting at launch), which covers hosting, software updates and small text or photo edits. You can cancel the care plan at any time; the website stops being hosted by us at the end of the paid month, and on request we provide a copy of your site files.",
          "You keep ownership of the content you provide and, once paid in full, of your website's design and pages. You confirm you have the rights to the logos, photos and texts you send us. Stock photos we add are licensed for use on your website only."
        ]
      },
      {
        "title": "Refunds and payment disputes",
        "paragraphs": [
          "Refunds are governed by our Refund policy. Government filing fees we have already paid to the State of Florida or another agency on your behalf are non-refundable, because the agency does not return them.",
          "If you have a problem with a charge, please contact us first so we can resolve it. If you dispute a charge with your bank for a service we have already performed, we will provide the bank with evidence of the work, including the state filing record."
        ]
      },
      {
        "title": "Limitation of liability",
        "paragraphs": [
          "To the extent permitted by law, our total liability for any claim related to an order is limited to the service fees you paid us for that order, excluding government fees. We are not liable for indirect or consequential damages, or for the decisions or delays of government agencies."
        ]
      },
      {
        "title": "Governing law",
        "paragraphs": [
          "These terms are governed by the laws of the State of Florida. Any dispute will be resolved in the state or federal courts located in Polk County, Florida."
        ]
      },
      {
        "title": "Changes and contact",
        "paragraphs": [
          "We may update these terms. The version posted when you place an order applies to that order. For questions, use our contact page."
        ]
      }
    ],
    "actions": [
      {
        "label": "Refund policy",
        "href": "/refund-policy"
      },
      {
        "label": "Contact us",
        "href": "/contact"
      }
    ],
    "draft": true
  },
  "refund-policy": {
    "title": "Refund policy",
    "intro": "How cancellations and refunds work for orders placed on agenteregistradofl.com.",
    "updated": "Updated October 26, 2026",
    "sections": [
      {
        "title": "Before we submit your filing",
        "paragraphs": [
          "You can cancel for a full refund, including the state fee, at any time before we submit your filing to the State of Florida or the IRS. Contact us as soon as possible with your order details."
        ]
      },
      {
        "title": "After submission",
        "paragraphs": [
          "Once a filing has been submitted, the service fee and the state fee for that filing are non-refundable, because the work has been done and the State of Florida does not return filing fees."
        ]
      },
      {
        "title": "If the state rejects a filing",
        "paragraphs": [
          "If the State of Florida rejects a filing (for example, because the name is not available), we will correct and resubmit it at no additional service fee. A new state fee applies only if the state requires one."
        ]
      },
      {
        "title": "Add-ons not yet started",
        "paragraphs": [
          "Add-ons we have not started, such as an annual report filing for a future year, can be cancelled for a refund of that add-on before we begin the work."
        ]
      },
      {
        "title": "Registered agent service",
        "paragraphs": [
          "Registered agent service is refundable until your formation filing is submitted, because the state record then names us as your agent. After that, the current service period is non-refundable."
        ]
      },
      {
        "title": "Website services",
        "paragraphs": [
          "For the Business + Website package, the website part ($999 of the package price) is fully refundable until we deliver the first design draft. After the first draft is delivered, cancelling refunds 50% of the website part. After the website is launched, the website part is non-refundable. The formation part follows the rules above.",
          "The monthly care plan can be cancelled at any time and is not refunded for the month already paid."
        ]
      },
      {
        "title": "How refunds are paid",
        "paragraphs": [
          "Approved refunds go back to your original payment method through Stripe, usually within 5 to 10 business days depending on your bank."
        ]
      }
    ],
    "actions": [
      {
        "label": "Terms of Service",
        "href": "/terms"
      },
      {
        "label": "Contact us",
        "href": "/contact"
      }
    ],
    "draft": true
  }
};
