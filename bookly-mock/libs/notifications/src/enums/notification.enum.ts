/**
 * Email Provider Types
 */
export enum EmailProviderType {
  NODEMAILER = "NODEMAILER",
  SENDGRID = "SENDGRID",
  AWS_SES = "AWS_SES",
  GMAIL = "GMAIL",
  OUTLOOK = "OUTLOOK",
}

/**
 * Push Provider Types
 */
export enum PushProviderType {
  FIREBASE = "FIREBASE",
  ONESIGNAL = "ONESIGNAL",
  AWS_SNS = "AWS_SNS",
  EXPO = "EXPO",
  APNS = "APNS", // Apple Push Notification Service
  FCM = "FCM", // Firebase Cloud Messaging
}

/**
 * WhatsApp Provider Types
 */
export enum WhatsAppProviderType {
  TWILIO = "TWILIO",
  META_CLOUD_API = "META_CLOUD_API",
}

/**
 * SMS Provider Types
 */
export enum SmsProviderType {
  TWILIO = "TWILIO",
  AWS_SNS = "AWS_SNS",
  VONAGE = "VONAGE",
  MESSAGEBIRD = "MESSAGEBIRD",
}

/**
 * Webhook Event Types
 */
export enum WebhookEventType {
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced",
  COMPLAINED = "complained",
  UNSUBSCRIBED = "unsubscribed",
  FAILED = "failed",
}
