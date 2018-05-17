import {Component, Pipe, ViewChild} from '@angular/core';
import {AlertController, Content, ModalController, Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {_} from 'underscore';
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
import {Deeplinks} from '@ionic-native/deeplinks';
import {BackgroundMode} from '@ionic-native/background-mode';
import {LocalNotifications} from '@ionic-native/local-notifications';
import {TranslateService} from "@ngx-translate/core";
import {Geolocation} from "@ionic-native/geolocation";
import {ProductDetailPage} from "../pages/product-detail/product-detail";
import {Message} from "./Entity/Message";
import { Network } from '@ionic-native/network';


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
    public static messageCnt;
    rootPage: any;

    static pages: Array<{ id: number, title: string, component: any, slug: string }>;
    pages: Array<{ id: number, title: string, component: any, slug: string }>;

    categories: Array<Category>;
    static categories: Array<Category>;

    static children = {};

    regions: Array<{ id: number|string, name: string, shortcut: string, image: any }>;
    static regions: Array<{ id: number, name: string, shortcut: string, image: any }>;

    public static loggedUser: User = null;
    loggedUser: User = null;

    search = {
        product: '',
        segment: '',
        locality: ''
    };

    public static message = {
        idFrom: 0,
        idTo: 0,
        idDemand: undefined
    };

    messageBody = '';
    public static opponent;

    public static conversation = [];

    count = 0;

    static emptyUser = new User(
        0, '', '', '', 1, '', '', '', '', '', '', '', 0, '', true, ''
    );

    private lat;
    private lng;

    static offer: Product = null;
    static demandQty: number = 0;
    static idDetailAuthor: number = 0;

    public static lang = 'sk';

    public static following = [];
    public static notified = [];
    static nav;
    private locality: string = '';
    private product: string = '';
    private segment: string = '';
    public static mustAgree = false;
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
                private translate: TranslateService,
                private network: Network,
                private geo: Geolocation) {
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

        MyApp.regions = [
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
        this.regions = [{id: '', name: 'Bez regiónu', image: '', shortcut: ''}];
        for(let region of MyApp.regions) {
            this.regions.push(region);
        }
        this.storage.get('loggedUser').then((data) => {
            MyApp.loggedUser = data;
            if (MyApp.loggedUser != null) {
                MyApp.getFavourites(MyApp.loggedUser.id, this.api, this.geo, this.notif).then(() => {
                    this.categories = MyApp.categories;
                    this.storage.set('categories', MyApp.categories);
                });
                this.rootPage = MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage;
            } else {
                MyApp.getFavourites(1, this.api, this.geo, this.notif);
                this.rootPage = LoginPage;
            }
            this.loggedUser = MyApp.loggedUser;
            this.splashScreen.hide();
        });
        this.storage.get('categories').then(categories => {
            if(categories) {
                this.categories = MyApp.categories = categories;
            }
        });
        this.network.onConnect().subscribe(() => {
            let view = this.nav.getActive().component;
            if (this.nav.getViews().length <= 1) {
                this.nav.setRoot(view);
            } else {
                this.nav.pop().then(() => {
                    this.nav.push(view);
                });
            }
        });
    }

    getCategories() {
        let cats = [{id: '', name: 'Bez kategórie'}];
        for(let cat of MyApp.categories) {
            cats.push(cat);
        }
        return cats;
    }

    getActivePage(): string {
        return this.nav.getActive() ? this.nav.getActive().name : '';
    }

    static getNewFarmers(geo: Geolocation, api: ApiProvider, notif: LocalNotifications) {
        geo.getCurrentPosition().then(item => {
            let lat = item.coords.latitude;
            let lng = item.coords.longitude;
            let km = 5;
            api.getNearbyOffers(lat, lng, km).then(response => {
                let offers: Array<Product> = response['offers'].map(item => {
                    item['author']['isFarmer'] = true;
                    return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']))
                }).filter((item: Product) => {
                    return _.contains(MyApp.following, item.category.id);
                }).filter((item: Product) => {
                    return !_.contains(MyApp.notified, item.author.id);
                });
                for (let offer of offers) {
                    MyApp.notified.push(offer.id);
                    if (_.contains(MyApp.notified, offer.author.id)) {
                        continue;
                    }
                    MyApp.notified.push(offer.author.id);
                    notif.schedule({
                        id: 1,
                        title: 'Farma v okolí',
                        text: `Farma ${offer.author.name}, ktorá vyrába kategóriu, ktorú sledujete (${offer.category.name}) je v okruhu ${km}km.`,
                        sound: null,
                        at: new Date(new Date().getTime() + 1),
                        data: {farm: offer.author}
                    });
                }
            });
        });
    }

    static getFavourites(id, api: ApiProvider, geo: Geolocation, notif: LocalNotifications) {
        return new Promise(res => {
            api.getFavouriteOffers(id).then(resolve => {
                MyApp.categories = Object.keys(resolve['farmarCategories']).map(key => {
                    let category = ApiProvider.getCategory(resolve['farmarCategories'][key]);
                    MyApp.children[category.id] = category.children;
                    return category;
                });
                MyApp.favourites = resolve['offers'].map(item => {
                    return ApiProvider.getProduct(item);
                });
                MyApp.counts.favourites = resolve['offers'].length;
                MyApp.following = resolve['following'].map(cat => {
                    return cat['NeoContentCategory']['id'];
                });
                if (MyApp.loggedUser && !MyApp.loggedUser.farmer) {
                    setInterval(() => {
                        MyApp.getNewFarmers(geo, api, notif);
                    }, 1000 * 60);
                    MyApp.getNewFarmers(geo, api, notif);
                }
                res()
            });
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
            MyApp.nav = this.nav;
            this.notif.on('click', (notification) => {
                if(notification['data']) {
                    let data = notification['data'];
                    if(data['offer']) {
                        this.nav.push(ProductDetailPage, {
                            product: data['offer']
                        });
                    } else if(notification['data']['farm']) {
                        this.nav.push(ProfileFarmerPage, {
                            id: data['farm']
                        });
                    }
                }
            });
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
                MyApp.counts.demands = this.count = data['demands'];
                MyApp.counts.messages = this.count = data['messages'] + MyApp.counts.demands;
                for (let i = 0; i < data['notifications'].length; i++) {
                    let notification = data['notifications'][i];
                    this.notif.schedule({
                        id: 1,
                        title: notification['title'],
                        text: notification['text'],
                        sound: null,
                        at: new Date(new Date().getTime() + 1),
                        data: JSON.parse(notification['data'])
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
        this.api.get(`/neo_content/neo_content_offers/search?region=${this.locality}&produkt=${this.product}&segment[${this.segment}]=1`).then(data => {
            let offers = data['neoContentOffers'].map(offer => {
                offer['author']['isFarmer'] = true;
                return ApiProvider.getProduct(offer, ApiProvider.getUser(offer['author'], offer['author']));
            });
            let error = undefined;
            if(this.locality == '' && this.product == '' && this.segment == '') {
                error = 'Zadajte aspoň jeden parameter pre vyhľadávanie.';
            }
            if(this.nav.getActive().component == OfferListPage) {
                this.nav.pop();
            }
            this.nav.push(OfferListPage, {
                offers: offers,
                title: 'Vyhľadávanie',
                count: offers.length,
                error: error
            });
            this.locality = '';
            this.product = '';
            this.segment = '';
        });
    }

    showAccount() {
        this.nav.push(MyApp.loggedUser.farmer ? AccountFarmerPage : AccountCustomerPage);
    }

    openProfile(id) {
        if (MyApp.loggedUser.id) {
            this.nav.push(ProfileFarmerPage, {
                id: id,
            });
        }
    }

    openSettings() {
        this.nav.push(SettingsPage, {});
    }

    showList(offers: string | Array<{}>, title: string, refreshCounts:boolean = true) {
        this.nav.push(OfferListPage, {
            offers: offers,
            title: title,
            count: MyApp.counts.favourites,
            favs: true,
            refreshCounts: refreshCounts
        });
    }

    showMyList() {
        this.nav.push(MyOffersPage);
    }

    logout() {
        this.api.get('/logout', {
            force: {
                loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
            }
        });
        this.storage.remove('loggedUser').catch(err => {
            throw new Error(JSON.stringify(err));
        }).then(() => {
            MyApp.loggedUser = null;
            this.nav.setRoot(LoginPage);
        });
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

    /*updateProduct($evt) {
        this.product = $evt.value;
    }

    updateSegment($evt) {
        this.segment = $evt;
    }

    updateLocality($evt) {
        this.locality = $evt;
    }*/

    getAuthor() {
        return MyApp.idDetailAuthor;
    }

    sendMessage() {
        this.api.post('/neo_content/neo_content_inbox/add', {
            data: {
                NeoContentInbox: {
                    content: this.messageBody,
                    id_user_from: MyApp.message.idFrom,
                    id_user_to: MyApp.message.idTo,
                    id_demand: MyApp.message.idDemand,
                },
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            },
        }).then(response => {
        });
        MyApp.conversation.push(new Message(
            0, MyApp.loggedUser, MyApp.opponent, this.messageBody, new Date, false
        ));
        setTimeout(() => {
            MyApp.messageCnt.scrollToBottom(20);
        }, 100);
        this.messageBody = '';
    }

    hasToAgree() {
        return MyApp.mustAgree;
    }

    agree() {
        this.messageBody = `
                Používateľ ${MyApp.loggedUser.name} potvrdil váš záujem o dopyt. Kontakt:
                <br>
                <a href="https://odfarmara.sk/neo_content/neo_content_farmers_profile/view/${MyApp.loggedUser.scopeId}"
                   class="profil-logo profil-logo-det w-inline-block"
                   style="background-image: url('${MyApp.loggedUser.avatar}')">
                </a>
                <div class="clearfix"></div>
                <strong>
                    <a style="color: #888; text-decoration: none;"
                       href="https://odfarmara.sk/neo_content/neo_content_farmers_profiles/view/${MyApp.loggedUser.scopeId}">
                       ${MyApp.loggedUser.name}
                    </a>
                </strong>
                <div class="user-info">
                  <p><strong>Názov:</strong> ${MyApp.loggedUser.name}</p>
                  <p><strong>Email:</strong> ${MyApp.loggedUser.email}</p>
                  <p><strong>Tel.č.:</strong> ${MyApp.loggedUser.scopeExtra['phone']}</p>
                  <p><strong>Adresa:</strong> ${MyApp.loggedUser.street} 
                    <br>${MyApp.loggedUser.city}
                    <br>${MyApp.loggedUser.zip}</p>
                </div>
         `;
        this.sendMessage();
        MyApp.mustAgree = false;
    }
}
