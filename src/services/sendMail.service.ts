import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import { redisClient } from "../config/redis.config";
import { logger } from "../config/logger.config";
import debug from "debug";
import { generateEmailTemplate } from "../views/mail.view";
import { setInterval, clearInterval } from "node:timers";
// Types
interface EmailOptions {
  recipientName?: string;
  attachments?: SendMailOptions["attachments"];
  retries?: number;
  priority?: "high" | "normal" | "low";
}

interface EmailTask {
  to: string;
  subject: string;
  body: string;
  link: string;
  options?: EmailOptions;
  timestamp: number;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  attempts: number;
}

// Constants
const EMAIL_QUEUE_KEY = "email:queue";
const EMAIL_RETRY_QUEUE_KEY = "email:retry:queue";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff delays in ms
const QUEUE_TIMEOUT = 10; // seconds
const SERVICE_CHECK_INTERVAL = 5000; // ms

// Debug setup
const debugEmail = debug("email:service");
const debugQueue = debug("email:queue");

// Email service configuration
class EmailService {
  private transporter: Transporter;
  private isRunning: boolean = false;
  private serviceCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  private async validateConfig(): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP configuration is incomplete");
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
    options: EmailOptions = {},
    link: string  
  ): Promise<EmailResult> {
    const { recipientName, attachments, retries = MAX_RETRIES } = options;
    const html = generateEmailTemplate(subject, body, recipientName, link);
    const mailOptions: SendMailOptions = {
      from: process.env.SMTP_FROM_NAME ? `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>` : process.env.SMTP_FROM,
      to,
      subject,
      html,
      attachments,
    };

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < retries) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        debugEmail(`Email sent successfully to ${to} on attempt ${attempt + 1}`);
        return {
          success: true,
          messageId: info.messageId,
          attempts: attempt + 1,
        };
      } catch (error: any) {
        lastError = error;
        attempt++;
        logger.warn(
          `Attempt ${attempt} failed for email to ${to}: ${error.message}`
        );
        debugEmail(`Email sending failed on attempt ${attempt}: ${error.message}`);

        if (attempt < retries) {
          const delay = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Unknown error",
      attempts: attempt,
    };
  }

  private async processEmailTask(task: EmailTask): Promise<void> {
    const { to, subject, body, options, link } = task;
    debugQueue(`Processing email for ${to}`);

    const result = await this.sendEmail(to, subject, body, options, link);
    
    if (!result.success) {
      logger.warn(`Failed to send email to ${to} after ${result.attempts} attempts`);
      debugQueue(`Email sending failed for ${to}: ${result.error}`);
      
      // Move to retry queue if not at max retries
      if (result.attempts < MAX_RETRIES) {
        await this.queueEmailForRetry(task);
      }
    } else {
      logger.info(`Email sent successfully to ${to} (${result.messageId})`);
      debugQueue(`Email sent to ${to}`);
    }
  }

  private async queueEmailForRetry(task: EmailTask): Promise<void> {
    try {
      await redisClient.lPush(
        EMAIL_RETRY_QUEUE_KEY,
        JSON.stringify({ ...task, timestamp: Date.now() })
      );
      debugQueue(`Email queued for retry: ${task.to}`);
    } catch (error: any) {
      logger.error(`Failed to queue email for retry: ${error.message}`);
      debugQueue(`Retry queueing failed: ${error.message}`);
    }
  }

  private async processQueue(): Promise<void> {
    try {
      const emailTask = await redisClient.brPop(EMAIL_QUEUE_KEY, QUEUE_TIMEOUT);
      if (emailTask) {
        const task: EmailTask = JSON.parse(emailTask.element);
        await this.processEmailTask(task);
      } else {
        debugQueue("No emails in queue, waiting...");
      }
    } catch (error: any) {
      logger.error(`Email processing error: ${error.message}`);
      debugQueue(`Error in email processing loop: ${error.message}`);
    }
  }

  private async processRetryQueue(): Promise<void> {
    try {
      const retryTask = await redisClient.brPop(EMAIL_RETRY_QUEUE_KEY, QUEUE_TIMEOUT);
      if (retryTask) {
        const task: EmailTask = JSON.parse(retryTask.element);
        // Only process if enough time has passed since last attempt
        if (Date.now() - task.timestamp > RETRY_DELAYS[0]) {
          await this.processEmailTask(task);
        } else {
          // Put back in queue if not enough time has passed
          await this.queueEmailForRetry(task);
        }
      }
    } catch (error: any) {
      logger.error(`Retry queue processing error: ${error.message}`);
      debugQueue(`Error in retry queue processing: ${error.message}`);
    }
  }

  private startServiceCheck(): void {
    this.serviceCheckInterval = setInterval(async () => {
      try {
        await this.transporter.verify();
      } catch (error: any) {
        logger.error(`Email service health check failed: ${error.message}`);
        debugEmail(`Service health check failed: ${error.message}`);
        // Attempt to recreate transporter
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
    }, SERVICE_CHECK_INTERVAL);
  }

  public async start(): Promise<void> {
    logger.info(`Email Service worker ${process.pid} starting`);
    debugEmail(`Starting email service on worker ${process.pid}`);

    try {
      await this.validateConfig();
      await redisClient.connect();
      await this.transporter.verify();
      
      this.isRunning = true;
      this.startServiceCheck();
      
      debugEmail("Email service started successfully");
      logger.info("Email service started successfully");

      while (this.isRunning) {
        await Promise.all([
          this.processQueue(),
          this.processRetryQueue(),
        ]);
      }
    } catch (error: any) {
      logger.error(`Email Service failed to start: ${error.message}`);
      debugEmail(`Service startup failed: ${error.message}`);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.serviceCheckInterval) {
      clearInterval(this.serviceCheckInterval);
    }
    await this.transporter.close();
    await redisClient.disconnect();
    logger.info("Email service stopped");
    debugEmail("Email service stopped");
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export public interface
export async function queueEmail(
  to: string,
  subject: string,
  body: string,
  link: string,
  options?: EmailOptions
): Promise<void> {
  try {
    const task: EmailTask = {
      to,
      subject,
      body,
      link,
      options,
      timestamp: Date.now(),
    };

    await redisClient.lPush(EMAIL_QUEUE_KEY, JSON.stringify(task));
    logger.info(`Email queued for ${to}`);
    debugQueue(`Email queued: ${to}, ${subject}`);
  } catch (error: any) {
    logger.error(`Failed to queue email for ${to}: ${error.message}`);
    debugQueue(`Queueing failed: ${error.message}`);
    throw error;
  }
}

export const startEmailService = () => emailService.start();
export const stopEmailService = () => emailService.stop();
