import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';

interface PrivacySection {
  title: string;
  body: string;
  todo?: boolean;
}

// Standalone for the same reason as TermsPageComponent — see its comment.
@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.css']
})
export class PrivacyPageComponent {

  /**
   * Draft content — see the disclosure banner in the template. This has not
   * been reviewed by a licensed attorney and must not be relied upon as
   * final legal advice.
   */
  sections: PrivacySection[] = [
    {
      title: '1. Information We Collect',
      body: 'When you create an account or use Berliz, we collect account information (name, email, password), profile details you choose to add (photos, bio, fitness interests), and booking and scheduling data when you book a trainer or center. A future intake feature is planned to let users share medical and training-history information before a session — when that launches, this may include health-related information you enter voluntarily, and it will only ever be shared with the trainer or center you book with.'
    },
    {
      title: '2. How We Use Your Information',
      body: 'We use your information to operate the platform: creating and securing your account, connecting you with trainers and centers, processing bookings, sending you notifications about your account or bookings, and improving the reliability of the service. We do not sell your personal information.'
    },
    {
      title: '3. Who We Share Data With',
      body: 'Berliz uses a small number of third-party services to run the platform: Strapi, our content management system, which stores media such as profile and center images; and an email service provider we use to send account and booking notifications. We only share the minimum data those services need to do their job.'
    },
    {
      title: '4. Payments (Planned)',
      body: 'Payment processing is not yet live on Berliz. Once integrated, payments will be handled through Stripe, and Berliz will not directly store your card number or other payment credentials — Stripe handles that data under its own security and privacy practices. This section is a placeholder and will be finalized, and re-reviewed, before payments go live.',
      todo: true
    },
    {
      title: '5. Your Rights',
      body: 'You can request access to the personal data we hold about you, or request that we delete it, by contacting us using the details below. We will respond as quickly as we reasonably can.'
    },
    {
      title: '6. Cookies & Tracking',
      body: 'Berliz keeps this section deliberately minimal and honest: we do not currently use third-party advertising or analytics cookies on the public site. We use browser local storage to keep you signed in (your session token) so you do not have to log in on every visit. If that changes — for example if we add analytics in the future — this policy will be updated first.'
    },
    {
      title: '7. Children’s Privacy',
      body: 'Berliz is not intended for use by anyone under the age of 18. As a platform that connects users with fitness and combat-sports professionals, accounts are restricted to adults, and we do not knowingly collect information from minors.'
    },
    {
      title: '8. Changes to This Policy',
      body: 'We may update this policy as the platform evolves. Material changes will be reflected here with an updated "last updated" date.'
    }
  ];
}
