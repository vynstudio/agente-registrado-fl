import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/i18n/LanguageContext";
import { PLANS, type Entity, type Extra, type Plan } from "@/lib/catalog";

export interface Recommendation {
  entityType: Entity;
  plan: Plan;
  extras: Extra[];
  summary: string;
  reasons: string[];
  talkToProfessional: string[];
}

const PlanAdvisor = ({ onApply }: { onApply?: (r: Recommendation) => void }) => {
  const { t, lang } = useLang();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);

  const ask = async () => {
    if (description.trim().length < 20) {
      setError(t("Please describe your business in a few sentences."));
      return;
    }
    setLoading(true);
    setError(null);
    setRec(null);
    const { data, error } = await supabase.functions.invoke("plan-advisor", {
      body: { description, language: lang },
    });
    setLoading(false);
    if (error || !data?.recommendation) {
      setError(t("The advisor could not answer right now. Please try again."));
      return;
    }
    setRec(data.recommendation);
  };

  const planName = rec ? PLANS.find((p) => p.id === rec.plan)?.name : "";

  return (
    <div className="rounded-[20px] border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-accent" aria-hidden />
        <h2 className="text-lg font-semibold text-foreground">{t("Not sure what to choose? Ask our AI advisor")}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t("Tell us what your business will do, where you live and how many owners there are. We'll suggest a company type and package.")}
      </p>
      <label htmlFor="advisor-text" className="sr-only">{t("Describe your business")}</label>
      <Textarea
        id="advisor-text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder={t("Example: I live in Brazil and want to sell clothing online in the US with my sister. We may look for investors later.")}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={ask} disabled={loading} className="rounded-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? t("Thinking…") : t("Get my recommendation")}
        </Button>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>

      {rec && (
        <div className="mt-5 rounded-2xl bg-muted/50 p-4" aria-live="polite">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t("Our suggestion")}</p>
          <p className="text-lg font-semibold text-foreground">
            {rec.entityType === "llc" ? t("Florida LLC") : t("Florida corporation")} · {t(planName ?? "")}
          </p>
          <p className="mt-2 text-sm text-foreground">{rec.summary}</p>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-foreground">
            {rec.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          {rec.talkToProfessional.length > 0 && (
            <>
              <p className="mt-4 text-sm font-medium text-foreground">{t("Questions for a CPA or attorney")}</p>
              <ul className="mt-1 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {rec.talkToProfessional.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </>
          )}
          {onApply && (
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => onApply(rec)}>
              {t("Use this recommendation")}
            </Button>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            {t("AI-generated general information, not legal or tax advice. We can refer you to partner CPAs and attorneys.")}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanAdvisor;
