export type WidgetTheme =
  | "pye-light"
  | "pye-dark"
  | "graphite";

export interface PyeWidgetProps {
  rpcUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  voteAccount?: string;
  theme?: WidgetTheme;
  onClose?: () => void;
  /**
   * Internal — demo mode bypasses the wallet adapter and mocks all data + transactions.
   * Used by integrate.pye.fi; not part of the supported public API. May change or be
   * removed without notice.
   */
  demo?: boolean;
}
