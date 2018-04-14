import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {LoginPage} from "../login/login";

/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  private email = '';
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, public alerts: AlertController) {
  }

  submit() {
    this.api.post('/neo_shop/neo_shop_users/passwordReset', {
      'data[NeoShopUser][email]': this.email
    }).then(response => {
      if(response['sent']) {
        this.alerts.create({
            title: 'Odoslané',
            message: 'Skontrolujte svoju e-mailovú schránku.',
            buttons: ['OK'],
        }).present();
      } else {
          this.alerts.create({
              title: 'Chyba',
              message: response['error'],
              buttons: ['OK'],
          }).present();
      }
    })
  }

  goHome() {
      this.navCtrl.setRoot(LoginPage);
  }

}
