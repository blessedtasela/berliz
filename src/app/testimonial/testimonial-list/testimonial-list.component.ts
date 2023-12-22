import { Component, OnInit } from '@angular/core';
import { Testimonials } from '../../models/testimonials.model';

@Component({
  selector: 'app-testimonial-list',
  templateUrl: './testimonial-list.component.html',
  styleUrls: ['./testimonial-list.component.css']
})
export class TestimonialListComponent implements OnInit {
  testimonials: Testimonials[] = [];
  testimonialIndex: number = 0;

  constructor() {
    // this.testimonials = [
    //   { id: 1, name: "Mary Smith", date: "04/06/2023", testimony: "As someone who was new to fitness, I was intimidated to join a gym. However, the welcoming and inclusive environment of this gym made me feel at ease from day one. The trainers took the time to teach me proper form and technique, and now I feel confident and strong in my workouts.", imageUrl: "../../assets/clients/c1.jpg", center: "M-Fitness" },
    //   { id: 2, name: "John Anthony", date: "15/06/2023", testimony: "I've tried several gyms in the past, but none compare to this one. The state-of-the-art equipment, clean and spacious facilities, and friendly staff create an exceptional gym experience. The trainers are always available to provide guidance and support, ensuring I stay on track with my fitness goals", imageUrl: "../../assets/clients/c2.jpg", center: "Club Africain" },
    //   { id: 3, name: "Peter Mark", date: "22/06/2023", testimony: "Joining this gym has been a game-changer for me. Not only have I seen significant improvements in my physical health, but I've also gained a newfound sense of self-confidence. The trainers push me beyond my limits and motivate me to strive for greatness. It's a gym that truly helps you unleash your full potential.", imageUrl: "../../assets/clients/c3.jpg", center: "Fitness Park" },
    //   { id: 4, name: "Timothy Pipes", date: "02/06/2023", testimony: "I can't say enough positive things about this gym. The trainers are incredibly passionate and dedicated to helping members succeed. The group classes are dynamic and fun, and the personal training sessions have taken my fitness journey to new heights. This gym has become an essential part of my life.", imageUrl: "../../assets/clients/c4.jpg", center: "Unique Fitness" },
    //   { id: 5, name: "Godwin Joshua", date: "12/06/2023", testimony: "Joining this gym has been a life-changing experience. The trainers are incredibly knowledgeable and supportive, and the community here is fantastic. I've seen amazing results in my fitness journey, and I couldn't be happier.", imageUrl: "../../assets/clients/c5.jpg", center: "We Gym" },
    //   { id: 6, name: "Okeke Paul", date: "23/06/2023", testimony: "I've tried several gyms before, but none compare to this one. The facilities are top-notch, and the variety of classes and equipment is impressive. The trainers push me to my limits and help me achieve my fitness goals. Highly recommended!", imageUrl: "../../assets/clients/c6.jpg", center: "Imotion" },
    //   { id: 7, name: "Andrew John Gate", date: "11/06/2023", testimony: "I was hesitant to join a gym at first, but I'm so glad I did. The staff and trainers make me feel welcome and comfortable. They provide personalized workout plans and always motivate me to give my best. I've gained strength, confidence, and a whole new level of fitness.", imageUrl: "../../assets/clients/c7.jpg", center: "City Club" },
    //   { id: 8, name: "Berry White", date: "04/06/2023", testimony: "I've been a member of this gym for years, and I can honestly say it's like my second home. The positive atmosphere, friendly staff, and sense of community make every workout enjoyable. It's not just a gym; it's a place where you can grow physically and mentally.", imageUrl: "../../assets/clients/c8.jpg", center: "Be Fit" },
    //   { id: 9, name: "Mark Joshua", date: "09/06/2023", testimony: "This gym has helped me transform my lifestyle. The trainers educate me on proper nutrition, provide challenging workouts, and offer continuous support. It's not just about physical fitness; it's about holistic wellness. I feel healthier, happier, and more energized than ever before.", imageUrl: "../../assets/clients/c9.jpg", center: "Dream House" }
    // ];
  }

  ngOnInit() {
    this.testimonialCounter();
  }

  testimonialCounter() {
    setInterval(() => {
      this.toggleTestimonial(1);
    }, 8000);
  }

  toggleTestimonial(n: number): void {
    this.testimonialIndex = (this.testimonialIndex + n + this.testimonials.length) % this.testimonials.length;
  }
}
