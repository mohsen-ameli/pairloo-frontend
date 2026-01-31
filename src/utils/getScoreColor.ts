import { colors } from "@/src/utils/colors"

export function getScoreColor(score: number): string {
  if (score < 0.25) {
    return colors.errorRed
  } else if (score < 0.75) {
    return colors.yellow
  } else {
    return colors.successGreen
  }
}
