import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../authorization.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {
  error: string | null = null;
  credentials = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
  });

  errorSub = new Subscription();

  constructor(
    private authService: AuthorizationService,
    private nav: NavController
  ) {}

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

  async login() {
    const email = this.credentials.controls['email'];
    const password = this.credentials.controls['password'];
    if (this.credentials.valid && email.value && password.value) {
      const user = await this.authService.login({
        email: email.value,
        password: password.value,
      });
      switch (typeof user) {
        case 'object':
          this.nav.navigateRoot('home');
          break;
        case 'string':
          this.error = user;
          this.credentials.reset();
          break;
      }
    } else {
      this.credentials.markAllAsTouched();
    }
  }
}
