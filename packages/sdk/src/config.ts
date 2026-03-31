export interface PyeSDKConfig {
  rpcUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** If set, only detect stake accounts delegated to this vote account */
  voteAccount?: string;
}

let _config: PyeSDKConfig | null = null;

export function configurePyeSDK(config: PyeSDKConfig): void {
  _config = config;
}

export function getPyeConfig(): PyeSDKConfig {
  if (!_config) {
    throw new Error(
      "PyeSDK not configured. Call configurePyeSDK() before using SDK functions.",
    );
  }
  return _config;
}
