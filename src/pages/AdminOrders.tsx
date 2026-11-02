import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { PLANS, EXTRAS } from "@/lib/catalog";

interface Order {
  id: string;
  plan: string;
  entity_type: string;
  extras: string[];
  company_name: string;
  alt_company_name: string | null;
  business_purpose: string | null;
  owners: { name: string; ownership: number; role?: string; address?: string }[];
  filing: {
    principalAddress?: { street: string; city: string; region: string; zip: string; country: string };
    mailingSameAsPrincipal?: boolean;
    management?: "member" | "manager";
    shares?: number;
    effectiveDate?: string;
  };
  ein: { responsibleParty: string; taxId: "ssn" | "itin" | "none"; startDate: string; activity: string; employees: number } | null;
  signature_name: string | null;
  authorized_at: string | null;
  client_ip: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  country: string;
  address: string;
  language: string;
  total_cents: number;
  status: string;
  environment: string;
  created_at: string;
}

const STATUSES = ["pending", "paid", "filed", "completed", "processing", "failed", "abandoned"];

const statusStyle = (s: string) =>
  s === "paid" || s === "completed" ? "bg-accent/10 text-foreground border-accent/40"
  : s === "filed" ? "bg-muted text-foreground border-border"
  : "bg-background text-muted-foreground border-border";

const AdminOrders = () => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <AdminLayout title="Orders" description="Formation orders placed through checkout. Unpaid orders stay 'pending'.">
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : error ? (
        <p className="text-sm text-destructive">Could not load orders.</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((o) => (
            <li key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">
                  {o.company_name} <span className="text-muted-foreground font-normal">· {o.entity_type === "llc" ? "LLC" : "Corporation"} · {PLANS.find((p) => p.id === o.plan)?.name}</span>
                </p>
                <div className="flex items-center gap-2">
                  {o.environment === "sandbox" && <span className="text-[11px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">test</span>}
                  <select
                    aria-label="Order status"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`text-xs rounded-full border px-2 py-1 ${statusStyle(o.status)}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                ${(o.total_cents / 100).toFixed(2)} · {new Date(o.created_at).toLocaleString()} · lang {o.language.toUpperCase()}
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-foreground">
                <div>
                  <p><span className="text-muted-foreground">Contact:</span> {o.contact_name}</p>
                  <p><a className="underline" href={`mailto:${o.contact_email}`}>{o.contact_email}</a> · {o.contact_phone}</p>
                  <p><span className="text-muted-foreground">Lives in:</span> {o.country}</p>
                  <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Address:</span> {o.address}</p>
                </div>
                <div>
                  {o.alt_company_name && <p><span className="text-muted-foreground">Backup name:</span> {o.alt_company_name}</p>}
                  {o.extras.length > 0 && <p><span className="text-muted-foreground">Add-ons:</span> {o.extras.map((e) => EXTRAS.find((x) => x.id === e)?.name ?? e).join(", ")}</p>}
                  {o.business_purpose && <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Purpose:</span> {o.business_purpose}</p>}
                  {o.filing.principalAddress && (
                    <p><span className="text-muted-foreground">Principal address:</span> {Object.values(o.filing.principalAddress).join(", ")}
                      {o.filing.mailingSameAsPrincipal && <span className="text-muted-foreground"> (also mailing)</span>}</p>
                  )}
                  {o.filing.management && <p><span className="text-muted-foreground">Managed by:</span> {o.filing.management === "member" ? "members (member-managed)" : "managers (manager-managed)"}</p>}
                  {o.filing.shares && <p><span className="text-muted-foreground">Authorized shares:</span> {o.filing.shares.toLocaleString()}</p>}
                  <p><span className="text-muted-foreground">Effective date:</span> {o.filing.effectiveDate ?? "date of filing"}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-foreground">
                <p className="text-muted-foreground">People on the filing:</p>
                <ul className="list-disc pl-5">
                  {o.owners.map((x, i) => (
                    <li key={i}>{x.name} · {x.ownership}%{x.role && ` · ${x.role}`}{x.address && <span className="text-muted-foreground"> · {x.address}</span>}</li>
                  ))}
                </ul>
              </div>
              {o.ein && (
                <div className="mt-3 text-sm text-foreground">
                  <p className="text-muted-foreground">EIN application:</p>
                  <p>
                    Responsible: {o.ein.responsibleParty} · {o.ein.taxId === "none" ? "no SSN/ITIN (foreign applicant)" : `has ${o.ein.taxId.toUpperCase()} — call client to get it`} ·
                    started {o.ein.startDate} · {o.ein.activity} · {o.ein.employees} employees expected
                  </p>
                </div>
              )}
              {o.signature_name && (
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Authorized and agreed to terms by "{o.signature_name}" on {o.authorized_at && new Date(o.authorized_at).toLocaleString()}{o.client_ip && ` from IP ${o.client_ip}`}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
