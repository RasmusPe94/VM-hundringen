import { redirect } from "next/navigation";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { getUserProfile } from "@/lib/auth";
import { signInWithMagicLink } from "./actions";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user } = await getUserProfile();

  if (user) {
    redirect("/leaderboard");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        description="Logga in med en magisk länk. Alla deltagare använder samma privata app."
        title="Logga in"
      />
      <MessageBanner searchParams={searchParams} />
      <form
        action={signInWithMagicLink}
        className="space-y-4 rounded-md border border-neutral-200 bg-white p-5 shadow-soft"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800" htmlFor="email">
            E-post
          </label>
          <input
            autoComplete="email"
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            id="email"
            name="email"
            placeholder="namn@example.com"
            required
            type="email"
          />
        </div>
        <SubmitButton pendingText="Skickar länk...">Skicka magisk länk</SubmitButton>
      </form>
    </div>
  );
}
