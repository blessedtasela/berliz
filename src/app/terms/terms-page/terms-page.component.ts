import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';

interface TermsSection {
  title: string;
  body: string;
}

// Standalone rather than declared in a wrapper NgModule — a "TermsModule" that
// only ever declared this one component looked unused (nothing imports the
// module class itself, since app-routing.module.ts references the component
// directly) and got deleted as dead-code cleanup, which silently broke this
// page's i-feather/routerLink bindings. Standalone means the component owns
// its own dependencies directly and can't be orphaned like that again.
@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
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
      title: '2. Eligibility & Age Requirement',
      body: 'You must be at least 16 years old to create an account or use Berliz. By registering, you confirm that you meet this age requirement. Berliz may request age verification and may suspend or terminate accounts found to belong to users under 16.'
    },
    {
      title: '3. Nature of the Platform',
      body: 'Berliz connects users with independent trainers and centers. Berliz does not employ trainers or guarantee outcomes.'
    },
    {
      title: '4. User Responsibilities',
      body: 'You agree to use the platform lawfully, respect others, and maintain accurate account information.'
    },
    {
      title: '5. Trainer & Center Responsibilities',
      body: 'Trainers and centers must provide accurate qualifications, maintain safety, and comply with local regulations.'
    },
    {
      title: '6. Payments & Billing',
      body: 'Payments may include platform fees and taxes. Berliz is not responsible for disputes between users and trainers.'
    },
    {
      title: '7. Health & Safety Disclaimer',
      body: 'Fitness and combat sports involve risk. You participate voluntarily and at your own discretion.'
    },
    {
      title: '8. Prohibited Content & Conduct',
      body: 'Berliz has a zero-tolerance policy for nudity, sexually explicit material, and other inappropriate content anywhere on the platform, including profile photos, messages, and uploaded media. Harassment, unwanted sexual attention, hate speech, misrepresentation, illegal activity, and platform misuse are also strictly prohibited. Violating this policy results in content removal and may result in immediate account suspension or termination.'
    },
    {
      title: '9. Reporting Violations',
      body: 'If you encounter nudity, inappropriate content, harassment, or any other violation of these Terms, please report it immediately using the in-app reporting tools or by contacting support. Reports are reviewed by our team, and we will take appropriate action, which may include content removal, warnings, or account suspension. Retaliation against a user for making a good-faith report is itself a violation of these Terms.'
    },
    {
      title: '10. Account Suspension',
      body: 'Berliz may suspend or terminate accounts that violate these terms.'
    },
    {
      title: '11. Community Guidelines',
      body: 'Treat all users, trainers, and centers with respect. Provide accurate information, follow safe training practices, and avoid illegal activity, harassment, or fraud. Respect others’ privacy and do not share private data without consent. Trainers must maintain safe environments and respond to concerns promptly. Violations can be reported through the platform or by contacting support.'
    }
  ];
}
