export const CONFIG = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  DB_ENCRYPTION_KEY: process.env.DB_ENCRYPTION_KEY || '',
  ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID || '',
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY || '',
  LICENSE_KEY_SEED: process.env.LICENSE_KEY_SEED || '',
  
  // Default settings
  DEFAULT_WAKE_WORD: 'AXIS',
  SUBSCRIPTION_PRICE_NPR: 299,
  
  // Proactive trigger thresholds
  SCREEN_TIME_ALERT_MS: 2 * 60 * 60 * 1000, // 2 hours
  INACTIVITY_ALERT_MS: 40 * 60 * 1000, // 40 minutes
  LATE_NIGHT_HOUR: 2, // 2am
  
  // Confidence thresholds
  HIGH_CONFIDENCE_THRESHOLD: 0.85,
  LOW_CONFIDENCE_THRESHOLD: 0.5,
};
