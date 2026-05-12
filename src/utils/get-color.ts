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

export function getStatusColor(status: StatusType): string {
  if (status === "active") {
    return colors.successGreen
  } else if (status === "inactive") {
    return colors.yellow
  } else if (status === "hidden") {
    return colors.errorRed
  } else if (status === "draft") {
    return colors.purple
  } else {
    return colors.darkGray
  }
}
