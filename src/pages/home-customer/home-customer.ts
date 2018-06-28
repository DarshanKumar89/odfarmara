import {Component} from '@angular/core';
import {Events, NavController, NavParams} from 'ionic-angular';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {OfferListPage} from "../offer-list/offer-list";
import {Geolocation} from '@ionic-native/geolocation';
import {MapPage} from "../map/map";
import {Storage} from "@ionic/storage";
import {_} from 'underscore';

/**
 * Generated class for the HomeCustomerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-home-customer',
    templateUrl: 'home-customer.html',
})
export class HomeCustomerPage extends Wrapper {
    area: number;

    private near = Array<Product>();
    private favourites = Array<Product>();
    private counts = {
        favourites: 0,
        near: 0
    };
    private prices;
    private loadingNearby = false;
    private offers = [];
    private regionImage: string;
    constructor(navCtrl: NavController, navParams: NavParams, sanitizer: DomSanitizer, private provider: ApiProvider, private geo: Geolocation, private storage: Storage, private evts: Events) {
        super(navCtrl, navParams, sanitizer);
        this.counts = MyApp.counts;
        this.refresh();
        setInterval(() => {
            this.refresh();
        }, 10000);
    }

    refresh() {
        this.storage.get('radius').then(radius => {
            this.area = isNaN(parseInt(radius)) ? 20 : parseInt(radius);
        });
        this.provider.getFavouriteOffers(MyApp.loggedUser.id).then(resolve => {
            this.favourites = resolve['offers'].map(item => {
                item['author']['isFarmer'] = true;
                return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']));
            });
            this.counts.favourites = resolve['offers'].length;
        });
        this.prices = MyApp.prices;
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[MyApp.loggedUser.region - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
        this.getNearby();
        this.evts.subscribe('diameter.update', () => {
            if(!this.loadingNearby) {
                this.loadingNearby = true;
                this.getNearby();
            }
        });
    }

    getNearby() {
        this.geo.getCurrentPosition().then(item => {
            let lat = item.coords.latitude;
            let lng = item.coords.longitude;
            this.storage.set('lastPos', {lat: lat, lng: lng});
            this.loadOffers(lat, lng);
        }).catch(item => {
            this.storage.get('lastPos').then(item => {
                let lat = item.lat;
                let lng = item.lng;
                this.loadOffers(lat, lng);
            }).catch(() => {
                let lat = 48.6670441;
                let lng = 18.5751242;
                this.loadOffers(lat, lng);
            });
        });
    }

    loadOffers(lat, lng) {
        this.provider.getOffers('/neo_content/neo_content_offers/show_favourites', MyApp.loggedUser.id, {
            lat: lat, lng: lng, area: this.area
        }, false).then(resp => {
            this.near = resp['offers'].map(item => {
                item['author']['isFarmer'] = true;
                return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']));
            });
            this.near.filter(a => {
                return _.contains(resp['liked'], a.id)
            });
            this.loadingNearby = false;
            this.counts.near = resp['offers'].length;
        });
    }

    showList(offers: string|Array<{}>, count:Number = 0, title:string = 'Moje sledované', refreshCounts: boolean = true) {
        this.navCtrl.push(OfferListPage, {
            offers: offers,
            count: count,
            title: title,
            favs: true,
            refreshCounts: refreshCounts
        });
    }

    openMap() {
        this.navCtrl.push(MapPage);
    }
}
