import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {Storage} from '@ionic/storage';
import {MyApp} from "../../app/app.component";
import {ForgotPasswordPage} from "../forgot-password/forgot-password";
import {RegisterPage} from "../register/register";
import {Geolocation} from "@ionic-native/geolocation";
import {LocalNotifications} from "@ionic-native/local-notifications";
import {GooglePlus} from "@ionic-native/google-plus";
import {Facebook, FacebookLoginResponse} from "@ionic-native/facebook";

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
                private gplus: GooglePlus,
                private fb: Facebook,
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
                try {
                    let user = ApiProvider.getUser(data['loggedUser'], data['address']);
                    MyApp.loggedUser = user;
                    this.storage.set('loggedUser', user);
                    this.navCtrl.setRoot(data['loggedUser']['isFarmer'] ? HomeFarmerPage : HomeCustomerPage, {
                        loggedUser: user
                    });
                    MyApp.getFavourites(user.id, this.provider, this.geo, this.notif);
                } catch (e) {
                    let alert = this.alert.create({
                        title: 'Chyba',
                        subTitle: 'Niekde sa stala chyba, skontrolujte svoje prihlasovacie údaje.',
                        buttons: ['OK']
                    });
                    alert.present();
                }
            }
        });
    }

    forgotPassword() {
        this.navCtrl.setRoot(ForgotPasswordPage);
    }

    registerPage() {
        this.navCtrl.setRoot(RegisterPage);
    }

    loginGooglePlus() {
        this.gplus.login({}).then(({email, userId}) => {
            this.loginSocial('googleplus', email, userId);
        });
    }

    loginFacebook() {
        this.fb.login(['public_profile', 'email']).then((response: FacebookLoginResponse) => {
            this.fb.api('me?fields=id,name,email', []).then(profile => {
                console.log('FB_LOGIN');
                this.loginSocial('facebook', profile['email'], profile['id']);
            });
        });
    }

    loginSocial(network, email, userId) {
        this.provider.get('/neo_content/neo_content_farmers_profiles/check?email=' + email).then((data) => {
            let exists = data['exists'];
            let waitFor = exists ? new Promise(resolve => resolve()) : new Promise((resolve, reject) => {
                this.alert.create({
                    title: 'Registrácia',
                    message: 'Toto konto sme nenašli v našej databáze. Chcete sa registrovať ako farmár alebo zákazník?',
                    buttons: [
                        {
                            text: 'Farmár',
                            handler() {
                                resolve('farmer');
                            }
                        },
                        {
                            text: 'Zákazník',
                            handler() {
                                resolve('customer');
                            }
                        },
                        {
                            text: 'Zrušiť',
                            handler() {
                                reject();
                            }
                        }
                    ]
                });
            });
            waitFor.then(type => {
                this.provider.post(`/social/${type === 'farmer' ? 'farmer/' : ''}${network}`, {
                    data: {
                        NeoShopUser: {
                            idSocial: userId,
                            username: email
                        }
                    }
                }).then(data => {
                    let user = ApiProvider.getUser(data['loggedUser'], data['address']);
                    MyApp.loggedUser = user;
                    this.storage.set('loggedUser', user);
                    this.navCtrl.setRoot(data['loggedUser']['isFarmer'] ? HomeFarmerPage : HomeCustomerPage, {
                        loggedUser: user
                    });
                    MyApp.getFavourites(user.id, this.provider, this.geo, this.notif);
                });
            });
        });
    }
}
