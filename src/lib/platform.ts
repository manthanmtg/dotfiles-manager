import os from "os";

export function getPlatformInfo() {
  const platform = process.platform;
  const supported = platform === "darwin" || platform === "linux";
  return { platform, supported, homedir: os.homedir() };
}

export function assertSupported() {
  const { supported, platform } = getPlatformInfo();
  if (!supported) {
    throw new Error(
      `Unsupported platform: ${platform}. Dotfiles Manager only supports macOS and Linux.`
    );
  }
}
