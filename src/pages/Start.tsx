import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Plus, Trash2, Loader2 } from "lucide-react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlanAdvisor, { type Recommendation } from "@/components/PlanAdvisor";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLang } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { EXTRAS, INCLUDED, PLANS, STATE_FEE, money, orderTotal, type Entity, type Extra, type Plan } from "@/lib/catalog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ACTIVITIES, ROLES, SUFFIXES, TAX_ID_CHOICES, fullCompanyName } from "@/lib/filing";

type Owner = { name: string; ownership: string; role: string; address: string };

const isPlan = (v: string | null): v is Plan =>
  v === "starter" || v === "professional" || v === "international" || v === "business_website";

const Start = () => {
  const { t, lang } = useLang();
  usePageTitle("Start your Florida company");
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<Plan>(isPlan(params.get("plan")) ? (params.get("plan") as Plan) : "professional");
  const [entity, setEntity] = useState<Entity>(params.get("entity") === "corp" ? "corp" : "llc");
  const [extras, setExtras] = useState<Extra[]>([]);
  const [form, setForm] = useState({
    companyName: "", altCompanyName: "", businessPurpose: "",
    contactName: "", contactEmail: "", contactPhone: "", country: "", address: "",
    street: "", city: "", region: "", zip: "", principalCountry: "United States",
    shares: "1000", effectiveDate: "",
    einStartDate: "", einActivityOther: "", einEmployees: "0",
    signatureName: "",
  });
  const [suffix, setSuffix] = useState("");
  const [management, setManagement] = useState<"member" | "manager">("member");
  const [mailingSame, setMailingSame] = useState(true);
  const [ein, setEin] = useState({ responsible: "0", taxId: "", activity: "" });
  const [agreed, setAgreed] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([{ name: "", ownership: "100", role: "", address: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [starting, setStarting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const available = EXTRAS.filter((x) => !INCLUDED[plan].includes(x.id));
  const chosen = extras.filter((e) => !INCLUDED[plan].includes(e));
  const needsEin = INCLUDED[plan].includes("ein") || chosen.includes("ein");
  const nameEnding = SUFFIXES[entity].includes(suffix) ? suffix : SUFFIXES[entity][0];
  // Member-managed LLC owners are all members; otherwise each person picks a role.
  const roleOf = (o: Owner, i: number) =>
    entity === "llc" && management === "member" ? "Member"
    : ROLES[entity].includes(o.role) ? o.role
    : entity === "corp" ? (i === 0 ? "President and director" : "Shareholder only")
    : (i === 0 ? "Member and manager" : "Member");
  const today = new Date().toISOString().slice(0, 10);
  const maxEffective = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
  const summary = useMemo(() => orderTotal(plan, entity, chosen), [plan, entity, chosen]);

  const applyRec = (r: Recommendation) => {
    setPlan(r.plan);
    setEntity(r.entityType);
    setExtras(r.extras);
    document.getElementById("package")?.scrollIntoView({ behavior: "smooth" });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e: Record<string, string> = {};
    const req = t("Required");
    if (!form.companyName.trim()) e.companyName = req;
    if (!form.contactName.trim()) e.contactName = req;
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) e.contactEmail = t("Enter a valid email");
    if (form.contactPhone.trim().length < 6) e.contactPhone = req;
    if (!form.country.trim()) e.country = req;
    if (!mailingSame && !form.address.trim()) e.address = req;
    (["street", "city", "region", "zip", "principalCountry"] as const).forEach((k) => { if (!form[k].trim()) e[k] = req; });
    if (/\bp\.?\s*o\.?\s*box\b|apartado postal|caixa postal/i.test(form.street)) e.street = t("Florida requires a street address, not a P.O. box.");
    if (form.effectiveDate && (form.effectiveDate < today || form.effectiveDate > maxEffective)) e.effectiveDate = t("Choose a date within the next 90 days.");
    owners.forEach((o, i) => {
      if (!o.name.trim()) e[`owner${i}`] = req;
      if (!o.address.trim()) e[`ownerAddress${i}`] = req;
    });
    const totalPct = owners.reduce((s, o) => s + (Number(o.ownership) || 0), 0);
    if (Math.round(totalPct) !== 100) e.ownership = t("Ownership must add up to 100%");
    const roles = owners.map(roleOf);
    if (entity === "corp") {
      if (!/^\d+$/.test(form.shares) || Number(form.shares) < 1) e.shares = t("Enter a whole number of shares.");
      if (roles.every((r) => r === "Shareholder only")) e.roles = t("Add at least one officer or director.");
    } else if (management === "manager" && !roles.some((r) => r.includes("anager"))) {
      e.roles = t("Add at least one manager.");
    }
    if (needsEin) {
      if (!ein.taxId) e.einTaxId = req;
      if (!ein.activity) e.einActivity = req;
      if (ein.activity === "Other" && !form.einActivityOther.trim()) e.einActivityOther = req;
      if (!form.einStartDate) e.einStartDate = req;
      if (!/^\d+$/.test(form.einEmployees)) e.einEmployees = req;
    }
    if (form.signatureName.trim().length < 3) e.signatureName = req;
    if (!agreed) e.agreed = t("Please check the box to continue.");
    setErrors(e);
    if (Object.keys(e).length) setTimeout(() => document.querySelector('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: "center" }));
    return Object.keys(e).length === 0;
  };

  const principalAddress = [form.street, `${form.city}, ${form.region} ${form.zip}`, form.principalCountry].map((s) => s.trim()).join(", ");
  const goToPayment = async () => {
    if (!validate()) return;
    setStarting(true);
    setCheckoutError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          language: lang, plan, entityType: entity, extras: chosen,
          companyName: fullCompanyName(form.companyName, nameEnding, entity),
          altCompanyName: form.altCompanyName.trim() ? fullCompanyName(form.altCompanyName, nameEnding, entity) : "",
          businessPurpose: form.businessPurpose,
          contactName: form.contactName, contactEmail: form.contactEmail, contactPhone: form.contactPhone,
          country: form.country,
          address: mailingSame ? principalAddress : form.address,
          owners: owners.map((o, i) => ({ name: o.name, ownership: Number(o.ownership) || 0, role: roleOf(o, i), address: o.address })),
          filing: {
            principalAddress: { street: form.street, city: form.city, region: form.region, zip: form.zip, country: form.principalCountry },
            mailingSameAsPrincipal: mailingSame,
            management: entity === "llc" ? management : undefined,
            shares: entity === "corp" ? Number(form.shares) : undefined,
            effectiveDate: form.effectiveDate || undefined,
          },
          ein: needsEin ? {
            responsibleParty: owners[Number(ein.responsible)]?.name ?? owners[0].name,
            taxId: ein.taxId,
            startDate: form.einStartDate,
            activity: ein.activity === "Other" ? `Other: ${form.einActivityOther}` : ein.activity,
            employees: Number(form.einEmployees),
          } : undefined,
          signatureName: form.signatureName,
          agreedToTerms: agreed,
        },
      });
      if (error || !data?.clientSecret) throw new Error();
      setClientSecret(data.clientSecret);
      setStep(3);
      window.scrollTo({ top: 0 });
    } catch {
      setCheckoutError(t("Could not start checkout. Please try again."));
    } finally {
      setStarting(false);
    }
  };

  const field = (k: keyof typeof form, label: string, opts: { type?: string; textarea?: boolean; optional?: boolean; hint?: string; min?: string; max?: string } = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{t(label)}{opts.optional && <span className="text-muted-foreground"> ({t("optional")})</span>}</Label>
      {opts.textarea ? (
        <Textarea id={k} value={form[k]} onChange={set(k)} maxLength={500} rows={3} />
      ) : (
        <Input id={k} type={opts.type ?? "text"} value={form[k]} onChange={set(k)} maxLength={k === "address" ? 300 : 120}
          min={opts.min} max={opts.max} aria-invalid={!!errors[k]} />
      )}
      {opts.hint && <p className="text-xs text-muted-foreground">{t(opts.hint)}</p>}
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );
  const select = (id: string, label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string }[], error?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t(label)}</Label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        {!value && <option value="">{t("Select…")}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
  const updateOwner = (i: number, patch: Partial<Owner>) => setOwners(owners.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const steps = ["Package", "Your details", "Payment"];

  return (
    <div className="min-h-dvh bg-background">
      <PaymentTestModeBanner />
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-[40px] font-medium text-foreground leading-tight">{t("Start your Florida business")}</h1>
          <ol className="mt-4 mb-8 flex flex-wrap gap-2 text-sm" aria-label={t("Progress")}>
            {steps.map((s, i) => (
              <li key={s} aria-current={step === i + 1 ? "step" : undefined}
                className={`rounded-full px-4 py-1.5 border ${step === i + 1 ? "bg-foreground text-background border-foreground" : step > i + 1 ? "border-border text-foreground" : "border-border text-muted-foreground"}`}>
                {i + 1}. {t(s)}
              </li>
            ))}
          </ol>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-8 min-w-0">
              {step === 1 && (
                <>
                  <PlanAdvisor onApply={applyRec} />

                  <section id="package" className="space-y-4 scroll-mt-32">
                    <h2 className="text-xl font-semibold text-foreground">{t("Company type")}</h2>
                    <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label={t("Company type")}>
                      {(["llc", "corp"] as Entity[]).map((e) => (
                        <button key={e} type="button" role="radio" aria-checked={entity === e} onClick={() => setEntity(e)}
                          className={`text-left flex flex-col justify-start h-full rounded-2xl border p-4 transition-colors ${entity === e ? "border-accent bg-accent/5" : "border-border hover:border-foreground/30"}`}>
                          <p className="font-semibold text-foreground">{e === "llc" ? t("Florida LLC") : t("Florida corporation")}</p>
                          <p className="text-sm text-muted-foreground">
                            {e === "llc" ? t("Simple and flexible. Best for most small businesses.") : t("Best if you plan to raise investment or issue shares.")}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{t("State fee")}: {money(STATE_FEE[e])}</p>
                        </button>
                      ))}
                    </div>

                    <h2 className="text-xl font-semibold text-foreground pt-4">{t("Package")}</h2>
                    <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label={t("Package")}>
                      {PLANS.map((p) => (
                        <button key={p.id} type="button" role="radio" aria-checked={plan === p.id} onClick={() => setPlan(p.id)}
                          className={`text-left flex flex-col justify-start h-full rounded-2xl border p-4 transition-colors ${plan === p.id ? "border-accent bg-accent/5" : "border-border hover:border-foreground/30"}`}>
                          <p className="font-semibold text-foreground">{t(p.name)}</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{money(p.price)} <span className="text-xs font-normal text-muted-foreground">{t("+ state fee")}</span></p>
                          <ul className="mt-3 space-y-1.5">
                            {p.features.map((f) => (
                              <li key={f} className="flex gap-1.5 text-xs text-foreground"><Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />{t(f)}</li>
                            ))}
                          </ul>
                        </button>
                      ))}
                    </div>

                    {available.length > 0 && (
                      <>
                        <h2 className="text-xl font-semibold text-foreground pt-4">{t("Add-ons")}</h2>
                        <div className="space-y-2">
                          {available.map((x) => (
                            <label key={x.id} className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer">
                              <Checkbox checked={extras.includes(x.id)}
                                onCheckedChange={(c) => setExtras(c ? [...extras, x.id] : extras.filter((e) => e !== x.id))} />
                              <span className="flex-1 text-sm text-foreground">{t(x.name)}</span>
                              <span className="text-sm font-medium text-foreground">{money(x.price)}{x.note && <span className="text-xs text-muted-foreground"> {t(x.note)}</span>}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                  <Button onClick={() => { setStep(2); window.scrollTo({ top: 0 }); }} className="rounded-full">{t("Continue")}</Button>
                </>
              )}

              {step === 2 && (
                <section className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">{t("Company")}</h2>
                    <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-start">
                      {field("companyName", "Company name")}
                      {select("suffix", "Name ending", nameEnding, setSuffix, SUFFIXES[entity].map((s) => ({ value: s, label: s })))}
                    </div>
                    {field("altCompanyName", "Backup name, in case the first is taken", { optional: true })}
                    {field("businessPurpose", "What will the business do?", { textarea: true, optional: true })}
                    {entity === "llc" ? (
                      select("management", "Who will manage the LLC?", management, (v) => setManagement(v as "member" | "manager"), [
                        { value: "member", label: "The owners (member-managed)" },
                        { value: "manager", label: "One or more managers (manager-managed)" },
                      ])
                    ) : (
                      field("shares", "Number of shares the corporation can issue", { type: "number", min: "1", hint: "Most small corporations use 1,000. Florida's filing fee is the same for any number." })
                    )}
                    {field("effectiveDate", "Start date of the company", { type: "date", optional: true, min: today, max: maxEffective, hint: "Leave empty to start on the day the state approves the filing." })}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">{t("Principal business address")}</h2>
                    <p className="text-sm text-muted-foreground -mt-2">{t("Where the business is run. It can be in any country, must be a street address (not a P.O. box), and appears on the public state record.")}</p>
                    {field("street", "Street address, including suite or apartment")}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("city", "City")}
                      {field("region", "State, province or region")}
                      {field("zip", "ZIP or postal code")}
                      {field("principalCountry", "Country")}
                    </div>
                    <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                      <Checkbox checked={mailingSame} onCheckedChange={(c) => setMailingSame(!!c)} />
                      {t("Mailing address is the same as the principal address")}
                    </label>
                    {!mailingSame && field("address", "Mailing address")}
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">{entity === "llc" ? t("Owners and managers") : t("Shareholders, officers and directors")}</h2>
                    <p className="text-sm text-muted-foreground -mt-1">{t("Names and addresses of the people listed on the filing appear on the public state record.")}</p>
                    {owners.map((o, i) => (
                      <div key={i} className="rounded-xl border border-border p-3 space-y-3">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <Label htmlFor={`owner-${i}`} className="sr-only">{t("Owner full name")}</Label>
                            <Input id={`owner-${i}`} placeholder={t("Owner full name")} value={o.name} maxLength={120} aria-invalid={!!errors[`owner${i}`]}
                              onChange={(e) => updateOwner(i, { name: e.target.value })} />
                            {errors[`owner${i}`] && <p className="text-xs text-destructive">{errors[`owner${i}`]}</p>}
                          </div>
                          <div className="w-24">
                            <Label htmlFor={`own-${i}`} className="sr-only">{t("Ownership %")}</Label>
                            <Input id={`own-${i}`} type="number" min={0} max={100} value={o.ownership} aria-label={t("Ownership %")}
                              onChange={(e) => updateOwner(i, { ownership: e.target.value })} />
                          </div>
                          {owners.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" aria-label={t("Remove owner")} onClick={() => setOwners(owners.filter((_, j) => j !== i))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`owner-address-${i}`} className="sr-only">{t("Home address (street, city, ZIP, country)")}</Label>
                          <Input id={`owner-address-${i}`} placeholder={t("Home address (street, city, ZIP, country)")} value={o.address} maxLength={300}
                            aria-invalid={!!errors[`ownerAddress${i}`]} onChange={(e) => updateOwner(i, { address: e.target.value })} />
                          {errors[`ownerAddress${i}`] && <p className="text-xs text-destructive">{errors[`ownerAddress${i}`]}</p>}
                        </div>
                        {!(entity === "llc" && management === "member") &&
                          select(`role-${i}`, "Role", roleOf(o, i), (v) => updateOwner(i, { role: v }), ROLES[entity].map((r) => ({ value: r, label: r })))}
                      </div>
                    ))}
                    {errors.ownership && <p className="text-xs text-destructive">{errors.ownership}</p>}
                    {errors.roles && <p role="alert" className="text-xs text-destructive">{errors.roles}</p>}
                    {owners.length < 10 && (
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setOwners([...owners, { name: "", ownership: "0", role: "", address: "" }])}>
                        <Plus className="w-4 h-4" /> {entity === "llc" && management === "member" ? t("Add owner") : t("Add person")}
                      </Button>
                    )}
                  </div>

                  {needsEin && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground">{t("EIN application")}</h2>
                      <p className="text-sm text-muted-foreground -mt-2">{t("The IRS asks these questions to issue your EIN.")}</p>
                      <div className="grid sm:grid-cols-2 gap-4 items-start">
                        {select("einResponsible", "Responsible person (an owner)", ein.responsible, (v) => setEin({ ...ein, responsible: v }),
                          owners.map((o, i) => ({ value: String(i), label: o.name.trim() || `${t("Owner")} ${i + 1}` })))}
                        {select("einTaxId", "Does this person have an SSN or ITIN?", ein.taxId, (v) => setEin({ ...ein, taxId: v }),
                          TAX_ID_CHOICES.map((c) => ({ value: c.id, label: c.label })), errors.einTaxId)}
                        {field("einStartDate", "Date the business started or will start", { type: "date" })}
                        {field("einEmployees", "Employees expected in the next 12 months", { type: "number", min: "0" })}
                        {select("einActivity", "Main business activity", ein.activity, (v) => setEin({ ...ein, activity: v }),
                          ACTIVITIES.map((a) => ({ value: a, label: a })), errors.einActivity)}
                        {ein.activity === "Other" && field("einActivityOther", "Describe the activity")}
                      </div>
                      <p className="rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm text-foreground">
                        {t("Do not type your SSN or ITIN anywhere on this site or send it by email. If you have one, we'll call you after payment to complete the IRS application with you.")}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">{t("Contact person")}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("contactName", "Full name")}
                      {field("contactEmail", "Email", { type: "email", hint: "The state also sends annual report reminders to this email." })}
                      {field("contactPhone", "Phone or WhatsApp", { type: "tel" })}
                      {field("country", "Country where you live")}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">{t("Authorization")}</h2>
                    <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                      <Checkbox className="mt-0.5" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} aria-invalid={!!errors.agreed} />
                      <span>
                        {t("I authorize Diler Services, LLC to prepare and file my company's formation documents with the Florida Division of Corporations, to act as authorized representative for this filing and, if ordered, to apply for an EIN with the IRS for my company. I confirm the information above is true and complete, and I agree to the")}{" "}
                        <Link to="/terms" target="_blank" className="underline">{t("Terms of Service")}</Link> {t("and")}{" "}
                        <Link to="/refund-policy" target="_blank" className="underline">{t("Refund policy")}</Link>.
                      </span>
                    </label>
                    {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}
                    {field("signatureName", "Type your full name as your signature")}
                  </div>

                  {checkoutError && <p role="alert" className="text-sm text-destructive">{checkoutError}</p>}
                  <div className="flex gap-3">
                    <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>{t("Back")}</Button>
                    <Button className="rounded-full" onClick={goToPayment} disabled={starting}>
                      {starting && <Loader2 className="w-4 h-4 animate-spin" />}{t("Continue to payment")}
                    </Button>
                  </div>
                </section>
              )}

              {step === 3 && clientSecret && (
                <section aria-label={t("Payment")}>
                  <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </section>
              )}
            </div>

            <aside className="rounded-[20px] bg-muted/50 p-5 lg:sticky lg:top-32" aria-label={t("Order summary")}>
              <h2 className="font-semibold text-foreground mb-3">{t("Order summary")}</h2>
              <p className="text-sm text-muted-foreground mb-3">{entity === "llc" ? t("Florida LLC") : t("Florida corporation")}</p>
              <ul className="space-y-2 text-sm">
                {summary.lines.map((l) => (
                  <li key={l.label} className="flex justify-between gap-3"><span className="text-foreground">{t(l.label)}</span><span className="text-foreground">{money(l.amount)}</span></li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-border flex justify-between font-semibold text-foreground">
                <span>{t("Total")}</span><span data-testid="order-total">{money(summary.total)}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("One-time payment. Sales tax, if any, is shown at checkout.")}</p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Start;
