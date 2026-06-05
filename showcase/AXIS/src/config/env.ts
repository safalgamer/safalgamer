const ENV = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  DB_ENCRYPTION_KEY: process.env.DB_ENCRYPTION_KEY || '',
  ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID || '',
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY || '',
  HOME_LAT: parseFloat(process.env.HOME_LATITUDE || '0'),
  HOME_LNG: parseFloat(process.env.HOME_LONGITUDE || '0'),
  HOME_RADIUS: parseInt(process.env.HOME_RADIUS_METERS || '100', 10),
  COLLEGE_LAT: parseFloat(process.env.COLLEGE_LATITUDE || '0'),
  COLLEGE_LNG: parseFloat(process.env.COLLEGE_LONGITUDE || '0'),
  COLLEGE_RADIUS: parseInt(process.env.COLLEGE_RADIUS_METERS || '150', 10),
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  SUBSCRIPTION_PRICE_NPR: 299,
};

export default ENV;
