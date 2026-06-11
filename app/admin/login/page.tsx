import { MessageBanner } from "@/components/message-banner";
import { SubmitButton } from "@/components/submit-button";
import { adminLoginAction } from "./actions";

type AdminLoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return (
    <div className="mx-auto max-w-sm space-y-6 py-4">
      <div className="text-center space-y-2 pb-2">
        <div className="text-5xl">🔑</div>
        <h1 className="text-2xl font-black text-bright">Admin-åtkomst</h1>
        <p className="text-sm text-muted">Ange lösenordet för att öppna adminportalen.</p>
      </div>
      <MessageBanner searchParams={searchParams} />
      <form action={adminLoginAction} className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-body" htmlFor="username">Lösenord</label>
          <input
            autoComplete="current-password"
            className="focus-ring w-full rounded-lg border border-border bg-rim px-3 py-2 text-bright placeholder:text-muted"
            id="username"
            name="username"
            placeholder="••••••"
            required
            type="password"
          />
        </div>
        <SubmitButton pendingText="Öppnar..." className="w-full">Öppna adminportal</SubmitButton>
      </form>
    </div>
  );
}
