import GraphemeSplitter from "grapheme-splitter";

/**
 * Truncate a string based on visual width, treating emojis as width 2 and normal chars as width 1.
 * This makes truncation more consistent for all-emoji, all-word, and mixed strings.
 */
export function formatString(
  str: string | null | undefined,
  maxLength: number
): string {
  if (!str) return "";
  const splitter = new GraphemeSplitter();
  const graphemes = splitter.splitGraphemes(str);
  let visualLength = 0;
  let result: string[] = [];
  for (const g of graphemes) {
    const isEmoji = /\p{Emoji}/u.test(g);
    const width = isEmoji ? 3 : 1;
    if (visualLength + width > maxLength) break;
    result.push(g);
    visualLength += width;
  }
  if (result.length < graphemes.length) {
    return result.join("") + "...";
  }
  return str;
}
