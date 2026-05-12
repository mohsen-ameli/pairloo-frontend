import { colors } from "@/src/utils/colors"
import { StatusType } from "../types/post.type"

export function getScoreColor(score: number): string {
  if (score < 0.25) {
    return colors.errorRed
  } else if (score < 0.75) {
    return colors.yellow
  } else {
    return colors.successGreen
  }
}

export function getStatusColor(status?: StatusType): string {
  if (status === "Active") {
    return colors.successGreen
  } else if (status === "Inactive") {
    return colors.yellow
  } else if (status === "Hidden") {
    return colors.errorRed
  } else {
    return colors.lightGray
  }
}
