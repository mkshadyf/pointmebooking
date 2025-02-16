
interface BookingDetails {
  service: string;
  business: string;
  date: string;
  time: string;
}

export class EmailService {
  static async sendVerificationEmail(email: string | undefined, code: string) {
    if (!email) {
      throw new Error('Email is required');
    }
    
    const response = await fetch('/api/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      throw new Error('Failed to send verification email');
    }
  }

  static async sendBookingConfirmation(email: string, booking: BookingDetails) {
    const response = await fetch('/api/email/booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, booking }),
    });

    if (!response.ok) {
      throw new Error('Failed to send booking confirmation');
    }
  }

  static async sendBookingReminder(email: string, booking: BookingDetails) {
    const response = await fetch('/api/email/booking-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, booking }),
    });

    if (!response.ok) {
      throw new Error('Failed to send booking reminder');
    }
  }

  static async sendPasswordReset(email: string, resetLink: string) {
    const response = await fetch('/api/email/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetLink }),
    });

    if (!response.ok) {
      throw new Error('Failed to send password reset email');
    }
  }

  static async sendBookingStatusUpdate(email: string, booking: BookingDetails, status: string) {
    const response = await fetch('/api/email/booking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, booking, status }),
    });

    if (!response.ok) {
      throw new Error('Failed to send booking status update');
    }
  }
} 