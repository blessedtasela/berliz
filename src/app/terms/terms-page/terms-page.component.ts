import { Component } from '@angular/core';

interface TermsSection {
  title: string;
  body: string;
}

@Component({
  selector: 'app-terms-page',
  templateUrl: './terms-page.component.html',
  styleUrls: ['./terms-page.component.css']
})
export class TermsPageComponent {

  /**
   * Draft content — see the disclosure banner in the template. This has not
   * been reviewed by a licensed attorney and must not be relied upon as
   * final legal advice.
   */
  sections: TermsSection[] = [
    {
      title: '1. Acceptance of Terms',
      body: 'By using Berliz, you agree to these Terms of Service and confirm that all information you provide is accurate.'
    },
    {
      title: '2. Nature of the Platform',
      body: 'Berliz connects users with independent trainers and centers. Berliz does not employ trainers or guarantee outcomes.'
    },
    {
      title: '3. User Responsibilities',
      body: 'You agree to use the platform lawfully, respect others, and maintain accurate account information.'
    },
    {
      title: '4. Trainer & Center Responsibilities',
      body: 'Trainers and centers must provide accurate qualifications, maintain safety, and comply with local regulations.'
    },
    {
      title: '5. Payments & Billing',
      body: 'Payments may include platform fees and taxes. Berliz is not responsible for disputes between users and trainers.'
    },
    {
      title: '6. Health & Safety Disclaimer',
      body: 'Fitness and combat sports involve risk. You participate voluntarily and at your own discretion.'
    },
    {
      title: '7. Prohibited Activities',
      body: 'Misrepresentation, harassment, illegal activity, and platform misuse are strictly prohibited.'
    },
    {
      title: '8. Account Suspension',
      body: 'Berliz may suspend or terminate accounts that violate these terms.'
    },
    {
      title: '9. Community Guidelines',
      body: 'Treat all users, trainers, and centers with respect. Provide accurate information, follow safe training practices, and avoid illegal activity, harassment, or fraud. Respect others’ privacy and do not share private data without consent. Trainers must maintain safe environments and respond to concerns promptly. Violations can be reported through the platform or by contacting support.'
    }
  ];
}
