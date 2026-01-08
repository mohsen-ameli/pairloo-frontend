type RGBA = [number, number, number, number];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(colorA: RGBA, colorB: RGBA, t: number): RGBA {
  return [
    Math.round(lerp(colorA[0], colorB[0], t)),
    Math.round(lerp(colorA[1], colorB[1], t)),
    Math.round(lerp(colorA[2], colorB[2], t)),
    1,
  ];
}

function hexToRgba(hex: string): RGBA {
  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  // 3 digits
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  // 8 digits
  else if (hex.length == 9) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
    a = parseInt(hex[7] + hex[8], 16) / 255;
  }

  return [r, g, b, a];
}

export function getScoreColor(
  color_low: string,
  color_mid: string,
  color_high: string,
  score: number
) {
  const low = hexToRgba(color_low);
  const mid = hexToRgba(color_mid);
  const high = hexToRgba(color_high);

  // score: 0 (low) -> 0.5 (mid) -> 1 (high)
  let rgba: RGBA;
  if (score <= 0.5) {
    // low to mid
    const t = score / 0.5;
    rgba = lerpColor(low, mid, t);
  } else {
    // mid to high
    const t = (score - 0.5) / 0.5;
    rgba = lerpColor(mid, high, t);
  }
  return `rgba(${rgba[0]},${rgba[1]},${rgba[2]})`;
}
