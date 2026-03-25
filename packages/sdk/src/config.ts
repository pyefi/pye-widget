export interface PyeSDKConfig {
  rpcUrl: string;
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
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
