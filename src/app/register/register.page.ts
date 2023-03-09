import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthorizationService, registerError } from '../authorization.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  error: string | null = null;

  credentials = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    repeat: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  errorSub = new Subscription()

  constructor(private auth: AuthorizationService, private nav: NavController) {}

  ngOnInit() {
    this.credentials.addValidators(this.matchValues());
    this.credentials.updateValueAndValidity();
  }

  ionViewWillEnter(){
    this.errorSub = this.credentials.valueChanges.subscribe(() => {
      if (this.error){
        this.error = null
      }
    })
  }

  ionViewWillLeave(){
    this.errorSub.unsubscribe();
  }


  async register() {
    const email = this.credentials.controls['email'];
    const password = this.credentials.controls['password'];
    const repeat = this.credentials.controls['repeat'];

    if (
      this.credentials.valid &&
      email.value &&
      password.value &&
      repeat.value
    ) {
      const user = await this.auth.register({
        email: email.value,
        password: password.value,
      });
      if (typeof user === 'object') {
        this.nav.navigateForward('/login');
      } else {
        switch (user) {
          case registerError.unknown:
            this.error = 'Onbekende error, probeer opnieuw.';
            break;
          case registerError.internal:
            this.error = 'Interne error, controleer je verbinding.';
            break;
          case registerError.invalid:
            email.setErrors({ email: true });
            break;
          case registerError.used:
            email.setErrors({ used: true });
            break;
          case registerError.weak:
            password.setErrors({
              minlength: {
                requiredLength: 6,
                actualLength: password.value.length,
              },
            });
            repeat.setErrors({
              minlength: {
                requiredLength: 6,
                actualLength: repeat.value.length,
              },
            });
            break;
        }
      }
    } else {
      this.credentials.markAllAsTouched();
    }
  }

  private matchValues(): ValidatorFn {
    return (): ValidationErrors | null => {
      const sourceCtrl = this.credentials.controls['password'];
      const targetCtrl = this.credentials.controls['repeat'];

      if (sourceCtrl && targetCtrl && sourceCtrl.value === targetCtrl.value) {
        // sourceCtrl.setErrors(null)
        // targetCtrl.setErrors(null)
        return null;
      }
      // sourceCtrl.setErrors({ match: false})
      // targetCtrl.setErrors({match: false})
      return { NoMatch: true };
    };
  }
}
