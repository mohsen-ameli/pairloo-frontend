// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL!
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_SERVER_URL!

export const VERIFICATION_RESEND_TIME = 5 // seconds
export const BLOCK_TIME = 5 * 60 * 1000 // 5 minutes
export const MAX_ATTEMPTS = 12 // attempts before blocking

export const TAB_HEIGHT = 83
export const REGISTER_USERNAME_CHECK_INTERVAL = 500 // milliseconds

export const MINIMUM_SHORT_ANSWER_LENGTH = 1

export const NUM_MESSAGES_TO_LOAD = 20
