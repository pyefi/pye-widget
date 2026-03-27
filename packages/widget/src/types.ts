export type WidgetTheme =
  | "pye-light"
  | "pye-dark"
  | "neutral-light"
  | "neutral-dark"
  | "midnight"
  | "rose"
  | "graphite"
  | "sand";

export interface PyeWidgetProps {
  rpcUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  voteAccount?: string;
  theme?: WidgetTheme;
  onClose?: () => void;
}
