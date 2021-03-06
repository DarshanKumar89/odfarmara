import {Component, ViewChild} from '@angular/core';
import {AlertController, NavController, NavParams, Content} from 'ionic-angular';
import {Wrapper} from "../../app/Helpers/Wrapper";
import {ApiProvider} from "../../providers/api/api";
import {DomSanitizer} from "@angular/platform-browser";
import {MyApp} from "../../app/app.component";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage extends Wrapper {
    @ViewChild(Content) content: Content;
    protected settings: { email: string, password: string };

    constructor(navCtrl: NavController, navParams: NavParams, sanitizer: DomSanitizer, private provider: ApiProvider, private alertCtrl: AlertController) {
        super(navCtrl, navParams, sanitizer);
        this.settings = {
            email: this.loggedUser.email,
            password: ''
        };
    }

    showAlert(success) {
        const alert = this.alertCtrl.create({
            title: success ? 'Nastavenia uložené' : 'Chyba',
            subTitle: success ? 'Nastavenia boli uložené' : 'Nastavenia neboli uložené, skúste to znova neskôr.',
            buttons: ['OK']
        });
        alert.present();
    }

    submitPassword() {
        this.provider.post('/users/edit', {
            _method: 'put',
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                },
                User: {
                    password: this.settings.password
                }
            }
        }).then(response => {
            this.showAlert(response['status'])
        })
    }

    submitEmail() {
        this.provider.post('/users/edit', {
            _method: 'put',
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                },
                User: {
                    username: this.settings.email
                }
            }
        }, 0, true).then(response => {
            this.showAlert(response['status'])
        })
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }

    scrollToPass() {
        this.content.scrollToBottom();
    }

}
