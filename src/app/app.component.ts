import {Component, Pipe, ViewChild} from '@angular/core';
import {AlertController, ModalController, Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {CmsPage} from "../pages/cms/cms";
import {ProfileFarmerPage} from "../pages/profile-farmer/profile-farmer";
import {User} from "./Entity/User";
import {SettingsPage} from "../pages/settings/settings";
import {HomeFarmerPage} from "../pages/home-farmer/home-farmer";
import {HomeCustomerPage} from "../pages/home-customer/home-customer";
import {LoginPage} from "../pages/login/login";
import {Storage} from "@ionic/storage";
import {MessagesPage} from "../pages/messages/messages";
import {ConversationPage} from "../pages/conversation/conversation";
import {OfferListPage} from "../pages/offer-list/offer-list";
import {ApiProvider} from "../providers/api/api";
import {AccountFarmerPage} from "../pages/account-farmer/account-farmer";
import {Product} from "./Entity/Product";
import {DemandsPage} from "../pages/demands/demands";
import {MyOffersPage} from "../pages/my-offers/my-offers";
import {OfferFormComponent} from "../components/offer-form/offer-form";
import {Category} from "./Entity/Category";
import {AccountCustomerPage} from "../pages/account-customer/account-customer";
import {MapPage} from "../pages/map/map";
import { Deeplinks } from '@ionic-native/deeplinks';
import { BackgroundMode } from '@ionic-native/background-mode';
import { LocalNotifications } from '@ionic-native/local-notifications';
import {TranslateService} from "@ngx-translate/core";


@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    public static prices = {
        2: 'g',
        1: 'kg',
        3: 'l',
        4: 'ks',
    };
    public static counts = {
        messages: 0,
        favourites: 0,
        near: 0,
        demands: 0
    };

    public static componentData = {
        region: 0,
        city: 0
    };

    favourites = Array<Product>();
    static favourites = Array<Product>();

    @ViewChild(Nav) nav: Nav;

    rootPage: any;

    static pages: Array<{ id: number, title: string, component: any, slug: string }>;
    pages: Array<{ id: number, title: string, component: any, slug: string }>;

    categories: Array<Category>;
    static categories: Array<Category>;

    static children = {};

    regions: Array<{ id: number, name: string, shortcut: string, image: any }>;
    static regions: Array<{ id: number, name: string, shortcut: string, image: any }>;

    public static loggedUser: User = null;
    loggedUser: User = null;

    search = {
        product: '',
        segment: '',
        locality: ''
    };

    count = 0;

    static emptyUser = new User(
        0, '', '', '', 1, '', '', '', '', '', '', '', 0, '', true, ''
    );

    static offer: Product = null;
    static demandQty: number = 0;
    static idDetailAuthor: number = 0;

    public static lang = 'sk';

    constructor(public platform: Platform,
                public statusBar: StatusBar,
                public splashScreen: SplashScreen,
                private storage: Storage,
                private api: ApiProvider,
                public modalCtrl: ModalController,
                public alertCtrl: AlertController,
                private deeplinks: Deeplinks,
                private bg: BackgroundMode,
                private notif: LocalNotifications,
                private translate: TranslateService) {
        this.initializeApp();

        this.translate.setDefaultLang(MyApp.lang);
        this.deeplinks.route({
            '/farmer/:id': ProfileFarmerPage
        });
        // used for an example of ngFor and navigation
        MyApp.pages = this.pages = [
            {id: 21, slug: 'ako-nakupovat', title: 'Ako nakupovať?', component: CmsPage},
            {id: 20, slug: 'ako-predavat', title: 'Ako predávať?', component: CmsPage},
            {id: 22, slug: 'o-projekte', title: 'O projekte', component: CmsPage},
            {id: 18, slug: 'faq', title: 'FAQ', component: CmsPage},
            {id: 16, slug: 'kontakt', title: 'Kontakt', component: CmsPage}
        ];

        MyApp.categories = [];

        MyApp.regions = this.regions = [
            {
                "id": 1,
                "name": "Banskobystrický kraj",
                "shortcut": "BC",
                "image": "BANSKA-BYSTRICA.svg"
            },
            {
                "id": 2,
                "name": "Bratislavský kraj",
                "shortcut": "BL",
                "image": "BRATISLAVA.svg"
            },
            {
                "id": 3,
                "name": "Košický kraj",
                "shortcut": "KI",
                "image": "KOSICE.svg"
            },
            {
                "id": 4,
                "name": "Nitriansky kraj",
                "shortcut": "NI",
                "image": "NITRA.svg"
            },
            {
                "id": 5,
                "name": "Prešovský kraj",
                "shortcut": "PV",
                "image": "PRESOV.svg"
            },
            {
                "id": 6,
                "name": "Trenčiansky kraj",
                "shortcut": "TC",
                "image": "TRENCIN.svg"
            },
            {
                "id": 7,
                "name": "Trnavský kraj",
                "shortcut": "TA",
                "image": "TRNAVA.svg"
            },
            {
                "id": 8,
                "name": "Žilinský kraj",
                "shortcut": "ZI",
                "image": "ZILINA.svg"
            }
        ];
        //this.storage.set('loggedUser', null);
        this.storage.get('loggedUser').then((data) => {
            MyApp.loggedUser = data;
            if (MyApp.loggedUser != null) {
                this.rootPage = MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage;
                api.getFavouriteOffers(MyApp.loggedUser.id).then(resolve => {
                    this.categories = MyApp.categories = Object.keys(resolve['farmarCategories']).map(key => {
                        let category = ApiProvider.getCategory(resolve['farmarCategories'][key]);
                        MyApp.children[category.id] = category.children;
                        return category;
                    });
                    MyApp.favourites = this.favourites = resolve['offers'].map(item => {
                        return ApiProvider.getProduct(item);
                    });
                    MyApp.counts.favourites = resolve['offers'].length;
                });
            } else {
                this.rootPage = LoginPage;
            }
            this.loggedUser = MyApp.loggedUser;
            this.splashScreen.hide();
        });
    }

    getLang() {
        return MyApp.lang;
    }

    langToggle() {
        MyApp.lang = MyApp.lang == 'sk' ? 'cs' : 'sk';
        this.translate.use(MyApp.lang);
    }

    getLoggedUser() {
        return MyApp.loggedUser;
    }

    openOfferFormModal() {
        let offerForm = this.modalCtrl.create(OfferFormComponent);
        offerForm.present();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.notifications();
            this.bg.enable();
        });
    }

    getOffer(): Product {
        return MyApp.offer;
    }

    getDemandQuantity(): number {
        return MyApp.demandQty;
    }

    getCounts() {

        return MyApp.counts;
    }

    notifications() {
        setInterval(() => {
            this.api.notifications().then(data => {
                MyApp.counts.messages = this.count = data['messages'];
                MyApp.counts.demands = this.count = data['demands'];
                for(let i = 0; i < data['notifications'].length; i++) {
                    let notification = data['notifications'][i];
                    this.notif.schedule({
                      id: 1,
                      title: notification['title'],
                      text: notification['text'],
                      sound: null,
                      at: new Date(new Date().getTime() + 1),
                    });
                }
            });
        }, 10000);
    }

    openPage(page) {
        this.nav.push(page.component, {
            page: page,
        });
    }

    openLogin() {
        this.nav.setRoot(LoginPage);
    }

    openMessages() {
        this.nav.push(MessagesPage);
    }

    openDemands() {
        this.nav.push(DemandsPage);
    }

    openConversation(idUser) {
        this.nav.push(ConversationPage);
    }

    formSearch() {
        this.api.get(`/neo_content/neo_content_offers/search?region=${this.search.locality}&produkt=${this.search.product}&segment[${this.search.segment}]=1`).then(data => {
            let offers = data['neoContentOffers'].map(offer => {
                offer['author']['isFarmer'] = true;
                return ApiProvider.getProduct(offer, ApiProvider.getUser(offer['author'], offer['author']));
            });
            this.nav.push(OfferListPage, {
                offers: offers,
                title: 'Vyhľadávanie',
                count: offers.length
            })
        });
    }

    showAccount() {
        this.nav.push(MyApp.loggedUser.farmer ? AccountFarmerPage : AccountCustomerPage);
    }

    openProfile(id) {
        if(MyApp.loggedUser.id) {
            this.nav.push(ProfileFarmerPage, {
                id: id,
            });
        }
    }

    openSettings() {
        this.nav.push(SettingsPage, {});
    }

    showList(offers: string | Array<{}>, title: string) {
        this.nav.push(OfferListPage, {
            offers: offers,
            title: title,
            count: MyApp.counts.favourites,
            favs: true
        });
    }

    showMyList() {
        this.nav.push(MyOffersPage);
    }

    logout() {
        this.storage.remove('loggedUser');
        MyApp.loggedUser = null;
        this.nav.setRoot(LoginPage);
    }

    order(product: Product, qty: number) {
        let alert = this.alertCtrl.create({
            title: 'Objednané',
            subTitle: `Dopyt o ponuku ${product.name} bol odoslaný.`,
            buttons: ['OK']
        });
        this.api.post('/neo_content/neo_content_demand/createDemand', {
            data: {
                NeoContentDemand: {
                    id_offer: product.id,
                    quantity: qty
                },
                NeoContentInbox: {
                    content: ''
                },
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(response => {
            alert.present();
        });
    }

    openMap() {
        this.nav.push(MapPage);
    }

    updateProduct($evt) {
        this.search.product = $evt.value;
    }

    updateSegment($evt) {
        this.search.segment = $evt;
    }

    updateLocality($evt) {
        this.search.locality = $evt;
    }

    getAuthor() {
        return MyApp.idDetailAuthor;
    }
}
