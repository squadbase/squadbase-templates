const colors = {
  red: "\x1b[0;31m",
  green: "\x1b[0;32m",
  yellow: "\x1b[1;33m",
  cyan: "\x1b[0;36m",
  reset: "\x1b[0m",
} as const;

type Color = keyof typeof colors;

export function log(color: Color, message: string): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}
