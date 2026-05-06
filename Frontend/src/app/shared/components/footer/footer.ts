import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  readonly Facebook = Facebook;
  readonly Twitter = Twitter;
  readonly Instagram = Instagram;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;

  year = new Date().getFullYear();
}
