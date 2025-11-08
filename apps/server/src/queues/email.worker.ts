import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from 'src/mail/mail.service';

@Processor('email')
export class EmailWorker extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-password-reset':
        const { email, token } = job.data;
        return this.mailService.sendPasswordReset(email, token);

      case 'send-welcome-email':
        const { email: welcomeEmail, token: welcomeToken } = job.data;
        return this.mailService.sendWelcomeEmail(welcomeEmail, welcomeToken);

      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
