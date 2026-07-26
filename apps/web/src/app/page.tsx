import { healthResponseSchema, type HealthResponse } from "@targets/shared";
import { env } from "@/lib/env";

async function getApiHealth(): Promise<{ ok: true; data: HealthResponse } | { ok: false; error: string }> {
  try {
    const response = await fetch(`${env.API_URL}/health`, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, error: `API responded with ${response.status}` };
    }
    const data = healthResponseSchema.parse(await response.json());
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "unknown error" };
  }
}

export default async function HomePage() {
  const health = await getApiHealth();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Targets Logistics — Phase 0</h1>
      <p className="text-sm text-neutral-600">
        This page proves the web app can reach the API server-side through the shared Zod schema
        in <code>packages/shared</code>. Marketing content lands in Phase 1/2.
      </p>
      {health.ok ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded border border-neutral-200 p-4 font-mono text-sm">
          <dt className="text-neutral-500">status</dt>
          <dd>{health.data.status}</dd>
          <dt className="text-neutral-500">db</dt>
          <dd>{health.data.db}</dd>
          <dt className="text-neutral-500">version</dt>
          <dd>{health.data.version}</dd>
          <dt className="text-neutral-500">timestamp</dt>
          <dd>{health.data.timestamp}</dd>
        </dl>
      ) : (
        <p className="rounded border border-red-300 bg-red-50 p-4 font-mono text-sm text-red-700">
          API unreachable: {health.error}
        </p>
      )}
    </main>
  );
}
