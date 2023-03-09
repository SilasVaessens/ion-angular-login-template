import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { NavController } from '@ionic/angular';
import { AuthorizationService } from '../authorization.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  user: UserCredential | null = null

  constructor(private auth: AuthorizationService, private nav: NavController) { 
  }

  ngOnInit() {
    this.user = this.auth.user.getValue()
  }

  async logout() {
    if (await this.auth.logout()){
      this.nav.navigateRoot('login')
    }
    else {
      console.log('logout failed');
    }
  }

}
