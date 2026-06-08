import { getPyeConfig } from "../config";

export interface OtcRequestPayload {
  contact: string;
  requestType: string;
  name?: string;
  organization?: string;
  describes?: string;
  solAmount?: string;
  timeframe?: string;
  validator?: string;
}

/**
 * Submit an OTC liquidity request. Posts to the `otc_submit` Supabase Edge
 * Function, which relays the request to Slack server-side. Throws on failure so
 * the caller can show an error and let the user retry.
 */
export async function submitOtcRequest(
  payload: OtcRequestPayload,
): Promise<void> {
  const { supabaseUrl, supabaseAnonKey } = getPyeConfig();

  // Raw fetch (rather than supabase-js `functions.invoke`) so we own the
  // throw-on-failure contract above and avoid spinning up a client for a
  // one-shot call. The anon key doubles as the bearer for this public function.
  const res = await fetch(`${supabaseUrl}/functions/v1/otc_submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  let result: { success?: boolean; error?: string } = {};
  try {
    result = await res.json();
  } catch {
    // Non-JSON response (e.g. gateway error) — fall through to the status check.
  }

  if (!res.ok || result.success === false) {
    throw new Error(
      result.error ?? `OTC submit failed with status ${res.status}`,
    );
  }
}
