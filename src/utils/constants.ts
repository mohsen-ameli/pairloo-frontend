export const NODE_ENV = process.env.NODE_ENV!

// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL!
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_SERVER_URL!

export const MIN_AGE = 13

export const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!

export const VERIFICATION_RESEND_TIME = NODE_ENV === "development" ? 5 : 60 // seconds
export const BLOCK_TIME = NODE_ENV === "development" ? 10 * 1000 : 5 * 60 * 1000 // 5 minutes
export const MAX_ATTEMPTS = 12 // attempts before blocking

export const TAB_HEIGHT = 83
export const REGISTER_USERNAME_CHECK_INTERVAL = 1000 // milliseconds

export const IS_TYPING_DEBOUNCE_TIME = 3000 // milliseconds

export const MINIMUM_SHORT_ANSWER_LENGTH = 1

export const NUM_MESSAGES_TO_LOAD = 20

export const MAX_POST_IMAGES = 5

export const ANDROID_ADS_UNIT_ID = process.env.EXPO_PUBLIC_ANDROID_ADS_UNIT_ID!
export const IOS_ADS_UNIT_ID = process.env.EXPO_PUBLIC_IOS_ADS_UNIT_ID!
export const WEB_ADS_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_ADS_CLIENT_ID!
