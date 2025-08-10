// server/utils/share.ts
// Shared helpers for server-side image generation and slug handling

export function slugify(str: string = ''): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

// Centered multi-line text wrapper
export function wrapText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = String(text || '').split(' ')
  let line = ''
  const lines: string[] = []

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const testWidth = ctx.measureText(testLine).width
    if (testWidth > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line)

  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lineHeight))
}
