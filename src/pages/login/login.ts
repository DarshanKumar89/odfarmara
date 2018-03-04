import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {Storage} from '@ionic/storage';
import {MyApp} from "../../app/app.component";

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {

    private login: { email: string, password: string, passwordRepeat: string, type: boolean };

    constructor(public navCtrl: NavController, public navParams: NavParams, private provider: ApiProvider, private alert: AlertController, private storage: Storage) {
        this.login = {email: '', password: '', passwordRepeat: '', type: false };
    }

    doLogin() {
        this.provider.login(this.login.email, this.login.password).then(data => {
            if (data['status'] == 0) {
                let alert = this.alert.create({
                    title: 'Chyba',
                    subTitle: data['message'],
                    buttons: ['OK']
                });
                alert.present();
            } else if(data['loggedUser'] == null) {
                let alert = this.alert.create({
                    title: 'Chyba',
                    subTitle: 'Účet nebol aktivovaný. Skontrolujte mailovú schránku.',
                    buttons: ['OK']
                });
                alert.present();
            } else {
                let user = ApiProvider.getUser(data['loggedUser'], data['address']);
                MyApp.loggedUser = user;
                this.storage.set('loggedUser', user);
                this.navCtrl.setRoot(data['loggedUser']['isFarmer'] ? HomeFarmerPage : HomeCustomerPage, {
                    loggedUser: user
                });
            }
        });
    }


    doRegister() {
      if(this.login.password != this.login.passwordRepeat) {
        let alert = this.alert.create({
            title: 'Chyba',
            subTitle: 'Heslá sa nezhodujú',
            buttons: ['OK']
        });
        alert.present();
      } else {
        this.provider.register(this.login.email, this.login.password, this.login.type).then(data => {
            if (data['status'] == 0) {
                let alert = this.alert.create({
                    title: 'Chyba',
                    subTitle: data['message'],
                    buttons: ['OK']
                });
                alert.present();
            } else {
                this.doLogin()
            }
        });
      }
    }

}
