import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Mail, Phone, MapPin, Camera, Save, Trash2, Loader2, Globe, Linkedin, Twitter, Github } from 'lucide-angular';
import { UserService } from '../../../core/services/user';
import { ToastService } from '../../../core/services/toast';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  readonly User = User;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Camera = Camera;
  readonly Save = Save;
  readonly Trash2 = Trash2;
  readonly Loader2 = Loader2;
  readonly Globe = Globe;
  readonly Linkedin = Linkedin;
  readonly Twitter = Twitter;
  readonly Github = Github;

  profile = signal<any>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isUploading = signal(false);
  isDeleting = signal(false);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Failed to load profile');
        this.isLoading.set(false);
      }
    });
  }

  onUpdateProfile() {
    this.isSaving.set(true);
    const dto = {
      fullName: this.profile().fullName,
      bio: this.profile().bio,
      phoneNumber: this.profile().phoneNumber,
      location: this.profile().location,
      skills: this.profile().skills,
      interests: this.profile().interests,
      socialLinks: this.profile().socialLinks
    };

    this.userService.updateProfile(dto).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.toastService.success('Profile updated successfully');
        this.isSaving.set(false);
        
        // Update local auth user info if needed
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.authService.currentUser.set({
            ...currentUser,
            name: updated.fullName
          });
        }
      },
      error: () => {
        this.toastService.error('Failed to update profile');
        this.isSaving.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      this.userService.uploadProfilePicture(file).subscribe({
        next: (res) => {
          const updatedProfile = { ...this.profile(), profilePictureUrl: res.profilePictureUrl };
          this.profile.set(updatedProfile);
          
          // Update global user state
          const currentUser = this.authService.currentUser();
          if (currentUser) {
            this.authService.currentUser.set({
              ...currentUser,
              profilePictureUrl: res.profilePictureUrl
            });
          }
          
          this.toastService.success('Profile picture updated');
          this.isUploading.set(false);
        },
        error: () => {
          this.toastService.error('Upload failed');
          this.isUploading.set(false);
        }
      });
    }
  }

  onDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action is permanent.')) {
      this.isDeleting.set(true);
      this.userService.deleteAccount().subscribe({
        next: () => {
          this.toastService.success('Account deleted successfully');
          this.authService.logout();
        },
        error: () => {
          this.toastService.error('Failed to delete account');
          this.isDeleting.set(false);
        }
      });
    }
  }

  addSkill(input: HTMLInputElement) {
    if (input.value.trim()) {
      const skills = [...this.profile().skills, input.value.trim()];
      this.profile.set({ ...this.profile(), skills });
      input.value = '';
    }
  }

  removeSkill(index: number) {
    const skills = this.profile().skills.filter((_: any, i: number) => i !== index);
    this.profile.set({ ...this.profile(), skills });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
