import {_} from "underscore";
import {Storage} from "@ionic/storage";
import {Geolocation} from "@ionic-native/geolocation";
import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {Data} from "../../app/Entity/Data";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {HomeCustomerPage} from "../home-customer/home-customer";

/**
 * Generated class for the OfferListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-offer-list',
    templateUrl: 'offer-list.html',
})
export class OfferListPage extends Wrapper {
    diameterOffers: number;
    refreshCounts: boolean;
    removed = [];
    selected: any[];
    categories = [];
    adding: any;
    favs: boolean;
    addingSegment: boolean;
    addingLocality: boolean;
    allCats = [];

    private title = '';
    private offers = [];
    private following = [];
    private prices = MyApp.prices;
    private counts = MyApp.counts;
    private area = 20;
    private cnts;
    private url = '';
    private interval;
    private regions = MyApp.regions;
    private lat;
    private lng;
    private region = null;
    private showList = false;
    error: string;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private api: ApiProvider,
                private sanit: DomSanitizer,
                private geolocation: Geolocation,
                private storage: Storage,
                private alertCtrl: AlertController) {
        super(navCtrl, navParams, sanit);
        let offers = this.navParams.data['offers'];
        this.error = this.navParams.data['error'];
        this.diameterOffers = 0;
        this.refreshCounts = this.navParams.data['refreshCounts'] == undefined ? true : this.navParams.data['refreshCounts'];
        this.cnts = this.navParams.data['count'] ? this.navParams.data['count'] : 0;
        if (typeof offers === 'string') {
            this.url = offers;
            geolocation.getCurrentPosition().then(item => {
                this.lat = item.coords.latitude;
                this.lng = item.coords.longitude;
                this.storage.set('lastPos', {lat: this.lat, lng: this.lng});
                this.getOffers(offers);
            }, item => {
                this.storage.get('lastPos').then(item => {
                    this.lat = item.lat;
                    this.lng = item.lng;
                }).catch(() => {
                    this.lat = 48.6670441;
                    this.lng = 18.5751242;
                });
            });
            this.interval = setInterval(() => {
                geolocation.getCurrentPosition().then(item => {
                    this.lat = item.coords.latitude;
                    this.lng = item.coords.longitude;
                    this.storage.set('lastPos', {lat: this.lat, lng: this.lng});
                    this.getOffers(offers);
                });
            }, 1000 * 60);
            this.getOffers(this.url);
        } else {
            this.offers = offers.map(offer => {
                return offer instanceof Product ? offer : ApiProvider.getProduct(offer);
            });
        }
        this.cnts = this.cnts || 0;
        this.title = `<span class="fa fa-heart-o"></span> ${this.navParams.data['title']} `;
        if(this.cnts > 0) {
            this.title += `<span class="label label-primary">${this.cnts}</span>`;
        }
        this.favs = !!this.navParams.get('favs');
        this.adding = false;
        this.addingSegment = false;
        this.addingLocality = false;
        this.storage.get('radius').then(radius => {
            this.area = isNaN(parseInt(radius)) ? 20 : parseInt(radius);
        });
    }

    selectLocality(index) {
        this.addingLocality = false;
        this.region = this.regions[index];
    }

    getOffers(offers) {
        this.api.getOffers(offers, MyApp.loggedUser.id, {
            area: this.area,
            lat: this.lat,
            lng: this.lng
        }).then(result => {
            this.offers = result[result['offers'] ? 'offers' : 'neoContentOffers'].map(offer => {
                let author = offer['author'], user;
                if(author instanceof Array) {
                    user = MyApp.emptyUser;
                    user.farmer = true;
                } else {
                    author['isFarmer'] = true;
                    user = ApiProvider.getUser(author ? author : offer, {'NeoContentAddress': {}});
                }
                return offer instanceof Product ? offer : ApiProvider.getProduct(offer, user);
            }).sort((a,b) => {
                return _.contains(result['liked'], a.id) ? -1 : 1;
            });
            this.diameterOffers = this.offers.length;
            this.following = result['following'];
            let categories = result['categoriesSelect'];
            let myCats = _.values(result['categories']);
            this.categories = categories[0];
            let cats = [];
            this.allCats = _.values(categories[0]);
            this.allCats = this.allCats.map(category => {
                category['NeoContentCategory']['children'] = categories[category['NeoContentCategory']['id']];
                return category;
            });
            myCats = myCats.map(category => {
                //category['NeoContentCategory']['children'] = categories[category['NeoContentCategory']['id']];
                category['NeoContentCategory']['children'].map(sub => {
                    cats.push(sub['NeoContentCategory']['id']);
                    return sub;
                });
                return category;
            });
            this.selected = cats;
            this.categories = this.categories.map(item => {
                item['children'] = categories[item['NeoContentCategory']['id']];
                item['open'] = false;
                item['children'] = item['children'].map(curr => {
                    curr['checked'] = _.contains(cats, curr['NeoContentCategory']['id']);
                    return curr;
                });
                return item;
            });
            if(this.refreshCounts) {
                this.cnts = this.offers.length;
                this.cnts = this.cnts || 0;
            }
            this.title = `<span class="fa fa-heart-o"></span> ${this.navParams.data['title']} `;
            if(this.cnts > 0) {
                this.title += `<span class="label label-primary">${this.cnts}</span>`;
            }
        });
    }

    toggleAdd(modal = false) {
        if (modal) {
            this.alertCtrl.create({
                title: 'Sledované uložené',
                message: 'Sledované kategórie boli uložené.',
                buttons: ['OK']
            }).present();

            for (let i = 0; i < this.removed.length; i++) {
                let id = this.removed[i];
                this.api.post('/neo_content/neo_content_offers/remove_favourite/' + id, {
                    data: {
                        force: {
                            loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                        }
                    }
                });
            }
            this.following = [];
            for (let i = 0; i < this.selected.length; i++) {
                let id = this.selected[i];
                if(typeof id == 'object') {
                    id = id['NeoContentCategory']['id'];
                }
                let cat;
                this.allCats.map(item => {
                    item['NeoContentCategory']['children'].map(c => {
                        if (id == c['NeoContentCategory']['id']) {
                            cat = c;
                        }
                    });
                });
                if (cat) {
                    cat['Regions'] = this.region;
                    if(!_.contains(this.removed, id)) {
                        this.following.push(cat);
                    }
                }
                this.api.post('/neo_content/neo_content_offers/add_favourite/' + id, {
                    data: {
                        force: {
                            loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                        },
                        idRegion: this.region ? this.region['id'] : null
                    }
                });
            }
        }
        this.adding = !this.adding;
    }

    toggleSegment() {
        this.addingSegment = !this.addingSegment;
    }

    toggleShowList() {
        this.showList = !this.showList;
    }

    toggleLocality() {
        this.addingLocality = !this.addingLocality;
    }

    deleteFromFavs(id) {
        this.following = this.following.filter(item => {
            return item['NeoContentCategory']['id'] != id;
        });
        this.api.post('/neo_content/neo_content_offers/remove_favourite/' + id, {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(() => {
        })
    }

    check(id) {
        this.categories = this.categories.map(item => {
            item['children'].map(child => {
                if (child['NeoContentCategory']['id'] == id) {
                    if (child['checked']) {
                        this.selected.filter(it => {
                            return it != id;
                        });
                        this.removed.push(id);
                        child['checked'] = false;
                    } else {
                        this.selected.push(id);
                        this.removed.filter(it => {
                            return it != id;
                        });
                        child['checked'] = true;
                    }
                }
            });
            return item;
        });
    }

    openSection(index) {
        this.categories[index]['open'] = true;
    }

    changeArea() {
        this.storage.set('radius', this.area);
        this.getOffers(this.url);
    }


    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
