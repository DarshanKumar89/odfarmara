import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {SplashScreen} from "@ionic-native/splash-screen";
import {Storage} from "@ionic/storage";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {MyApp} from "../../app/app.component";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {LoginPage} from "../login/login";
import {Geolocation} from "@ionic-native/geolocation";
import {LocalNotifications} from "@ionic-native/local-notifications";

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-register',
    templateUrl: 'register.html',
})
export class RegisterPage {

    private register: FormGroup;
    private login: { email: string, password: string, disabled: boolean };
    private disabled = false;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private provider: ApiProvider,
                private alert: AlertController,
                private storage: Storage,
                private geo: Geolocation,
                private notif: LocalNotifications,
                private fb: FormBuilder) {
        //this.register = {email: '', password: '', passwordRepeat: '', type: false, disabled: false};
        this.register = this.fb.group({
            email: new FormControl(''),
            password: new FormControl(''),
            passwordRepeat: new FormControl(''),
            type: new FormControl('farmer'),
        });
        this.login = {email: '', password: '', disabled: false};
    }

    changeType(type) {
        this.register.value.type = type;
    }

    doRegister() {
        this.disabled = true;
        if (this.register.value.password != this.register.value.passwordRepeat) {
            let alert = this.alert.create({
                title: 'Chyba',
                subTitle: 'Heslá sa nezhodujú',
                buttons: ['OK']
            });
            alert.present();
            this.disabled = true;
        } else if (this.register.value.password.length < 6) {
            let alert = this.alert.create({
                title: 'Chyba',
                subTitle: 'Heslo je príliš krátke',
                buttons: ['OK']
            });
            alert.present();
            this.disabled = true;
        } else {
            this.provider.register(this.register.value.email, this.register.value.password, this.register.value.type == 'farmer').then(data => {
                this.disabled = false;
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

    doLogin() {
        this.login.disabled = true;
        this.provider.login(this.register.value.email, this.register.value.password).then(data => {
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
                let user = ApiProvider.getUser(data['loggedUser'], data['address']);
                MyApp.loggedUser = user;
                this.storage.set('loggedUser', user);
                this.navCtrl.setRoot(data['loggedUser']['isFarmer'] ? HomeFarmerPage : HomeCustomerPage, {
                    loggedUser: user
                });
                MyApp.getFavourites(user.id, this.provider, this.geo, this.notif);
            }
        });
    }

    loginPage() {
        this.navCtrl.setRoot(LoginPage);
    }
}
