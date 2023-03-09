import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AuthorizationService, resetResult } from '../authorization.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  sendEmail: boolean = false;
  error: string | null = null;

  constructor(private authService: AuthorizationService, private toastContr: ToastController) {}

  ngOnInit() {}

  async send() {
    if (this.email.valid && this.email.value) {
      const result = await this.authService.resetPassword(this.email.value);
      switch (result) {
        case resetResult.unknown:
          this.error = 'Onbekende error, probeer opnieuw.'
          break;
        case resetResult.internal:
          this.error = 'Interne error, controleer je verbinding.';
          break;
        case resetResult.invalid:
          this.email.setErrors({email : true});
          break;
        case resetResult.notFound:
          this.email.setErrors({unknown : true});
          break;
        case resetResult.succes:
          const toast = await this.toastContr.create({
            duration: 1500,
            message: "Controleer je email",

          })
          await toast.present()
          break;
      }
    }
  }
}
