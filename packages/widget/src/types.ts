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
}
