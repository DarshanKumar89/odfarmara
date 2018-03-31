import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {Storage} from '@ionic/storage';
import {MyApp} from "../../app/app.component";
import {ForgotPasswordPage} from "../forgot-password/forgot-password";
import {SplashScreen} from "@ionic-native/splash-screen";
import {RegisterPage} from "../register/register";
import {Geolocation} from "@ionic-native/geolocation";
import {LocalNotifications} from "@ionic-native/local-notifications";

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

    private login: { email: string, password: string, disabled: boolean };

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private provider: ApiProvider,
                private alert: AlertController,
                private geo: Geolocation,
                private notif: LocalNotifications,
                private storage: Storage) {
        this.login = {email: '', password: '', disabled: false};
    }

    doLogin() {
        this.login.disabled = true;
        this.provider.login(this.login.email, this.login.password).then(data => {
            this.login.disabled = false;
            if (data['status'] == 0) {
                let alert = this.alert.create({
                    title: 'Chyba',
                    subTitle: data['message'],
                    buttons: ['OK']
                });
                alert.present();
            } else if (data['loggedUser'] == null) {
                let alert = this.alert.create({
                    title: 'Upozornenie',
                    subTitle: 'Účet nebol aktivovaný. Skontrolujte mailovú schránku.',
                    buttons: ['OK']
                });
                alert.present();
            } else {
                console.log('FROM WEB');
                console.log(data['loggedUser']);
                let user = ApiProvider.getUser(data['loggedUser'], data['address']);
                MyApp.loggedUser = user;
                console.log('PROCESSED');
                console.log(MyApp.loggedUser);
                this.storage.set('loggedUser', user);
                this.navCtrl.setRoot(data['loggedUser']['isFarmer'] ? HomeFarmerPage : HomeCustomerPage, {
                    loggedUser: user
                });
                MyApp.getFavourites(user.id, this.provider, this.geo, this.notif);
            }
        });
    }

    forgotPassword() {
        this.navCtrl.setRoot(ForgotPasswordPage);
    }

    registerPage() {
        this.navCtrl.setRoot(RegisterPage);
    }
}
