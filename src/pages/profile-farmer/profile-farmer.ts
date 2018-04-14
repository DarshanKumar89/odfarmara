import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {User} from "../../app/Entity/User";
import {DomSanitizer} from '@angular/platform-browser';
import {MyApp} from "../../app/app.component";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {ApiProvider} from "../../providers/api/api";
import {Product} from "../../app/Entity/Product";
import {ConversationPage} from "../conversation/conversation";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-profile-farmer',
    templateUrl: 'profile-farmer.html',
})
export class ProfileFarmerPage extends Wrapper {
    user: User;
    loggedUser: User;
    regions = MyApp.regions;
    stars: Array<string>;
    offers: Array<Product>;
    region: string;
    tab = 'profile';
    openingHours = {
        monday: 'Pondelok',
        tuesday: 'Utorok',
        wednesday: 'Streda',
        thursday: 'Štvrtok',
        friday: 'Piatok',
        saturday: 'Sobota',
        sunday: 'Nedeľa'
    };
    oh;
    private message = '';
    canBookmark = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, sanitizer: DomSanitizer, private api: ApiProvider, private alerts: AlertController) {
        super(navCtrl, navParams, sanitizer);
        let id = this.navParams.data.id;
        if(id) {
            api.get(isNaN(parseInt(id)) ? '/' + id : ('/neo_content/neo_content_farmers_profile/view/' + id)).then(response => {
                response['neoContentFarmersProfile']['isFarmer'] = true;
                this.user = ApiProvider.getUser(response['neoContentFarmersProfile'], response['neoContentFarmersProfile']);
                this.offers = response['neoContentFarmerOffers'].map(item => {
                    return ApiProvider.getProduct(item, this.user);
                });
                this.region = `https://odfarmara.sk/theme/Odfarmara/img/${this.regions[this.user.region - 1].image}`;
                let rating = this.user.rating;
                this.stars = [];
                for(let i = 0; i < 5; i++) {
                    this.stars.push('<span class="fa fa-star' + (i >= Math.round(rating) ? '-o' : '') + '"></span>');
                }
                this.canBookmark = response['canBookmark'];

            });
        }
        this.oh = Object.keys(this.openingHours);
        this.loggedUser = MyApp.loggedUser;
    }


    bookmark(idFarmer) {
        this.api.post('/neo_content/neo_content_farmers_profiles/bookmark_add/' + idFarmer, {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(() => {
            this.alerts.create({
                title: 'Úspešné',
                message: 'úspešne ste pridali farmára do obľúbených.',
                buttons: ['OK'],
            }).present();
        });
    }

    setTab(tab) {
        this.tab = tab;
    }

    sendMessage() {
        this.api.post('/neo_content/neo_content_inbox/add', {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                },
                NeoContentInbox: {
                    id_user_to: this.user.id,
                    id_user_from: MyApp.loggedUser.id,
                    content: this.message
                }
            }
        }).then(response => {
            this.navCtrl.push(ConversationPage, {
                idUser: this.user.id
            });
        });
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
