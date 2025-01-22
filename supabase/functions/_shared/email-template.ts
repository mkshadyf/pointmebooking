import { readFile } from 'https://deno.land/std@0.168.0/fs/mod.ts'
import { join } from 'https://deno.land/std@0.168.0/path/mod.ts'

interface TemplateData {
  [key: string]: string | number | boolean;
}

export class EmailTemplate {
  private templateName: string
  private data: TemplateData
  private template: string = ''
  private subjects: Record<string, string> = {
    'verification': 'Verify your email - PointMe!',
    'welcome': 'Welcome to PointMe!',
    'booking-confirmation': 'Booking Confirmation - PointMe!',
    'booking-reminder': 'Upcoming Appointment Reminder - PointMe!',
    'password-reset': 'Reset Your Password - PointMe!',
  }

  constructor(templateName: string, data: TemplateData) {
    this.templateName = templateName
    this.data = data
  }

  async render(): Promise<string> {
    try {
      // Load template file
      const templatePath = join(Deno.cwd(), 'templates', `${this.templateName}.html`)
      this.template = await readFile(templatePath, { encoding: 'utf8' })

      // Replace variables in template
      let renderedTemplate = this.template
      for (const [key, value] of Object.entries(this.data)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        renderedTemplate = renderedTemplate.replace(regex, String(value))
      }

      return renderedTemplate
    } catch (error) {
      console.error('Error rendering template:', error)
      throw error
    }
  }

  getSubject(): string {
    return this.subjects[this.templateName] || 'PointMe Notification'
  }
}
