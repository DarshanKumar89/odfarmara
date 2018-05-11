import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {OfferListPage} from "../offer-list/offer-list";
import {Geolocation} from '@ionic-native/geolocation';
import {MapPage} from "../map/map";
import {Storage} from "@ionic/storage";

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
    private offers = [];
    private regionImage: string;
    constructor(navCtrl: NavController, navParams: NavParams, sanitizer: DomSanitizer, private provider: ApiProvider, private geo: Geolocation, private storage: Storage) {
        super(navCtrl, navParams, sanitizer);
        this.counts = MyApp.counts;
        this.storage.get('radius').then(radius => {
            this.area = isNaN(parseInt(radius)) ? 20 : parseInt(radius);
        });
        provider.getFavouriteOffers(MyApp.loggedUser.id).then(resolve => {
            this.favourites = resolve['offers'].map(item => {
                item['author']['isFarmer'] = true;
                return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']));
            });
            this.counts.favourites = resolve['offers'].length;
        });
        geo.getCurrentPosition().then(response => {
            provider.getNearbyOffers(response.coords.latitude, response.coords.longitude, this.area).then(resp => {
                this.near = resp['offers'].map(item => {
                    item['author']['isFarmer'] = true;
                    return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']));
                });
                this.counts.near = resp['offers'].length;
            });
        }).catch(err => {});
        this.prices = MyApp.prices;
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[MyApp.loggedUser.region - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
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
