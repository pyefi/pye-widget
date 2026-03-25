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
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  validatorName?: string;
  theme?: WidgetTheme;
  onClose?: () => void;
}
