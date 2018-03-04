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

    private near = Array<Product>();
    private favourites = Array<Product>();
    private counts = {
        favourites: 0,
        near: 0
    };
    private prices;
    private offers = [];
    constructor(navCtrl: NavController, navParams: NavParams, sanitizer: DomSanitizer, private provider: ApiProvider, private geo: Geolocation) {
        super(navCtrl, navParams, sanitizer);
        this.counts = MyApp.counts;
        provider.getFavouriteOffers(MyApp.loggedUser.id).then(resolve => {
            this.favourites = resolve['offers'].map(item => {
                item['author']['isFarmer'] = true;
                return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']));
            });
            this.counts.favourites = resolve['offers'].length;
        });
        geo.getCurrentPosition().then(response => {
            provider.getNearbyOffers(response.coords.latitude, response.coords.longitude).then(resp => {
                this.near = resp['offers'].map(item => {
                    item['author']['isFarmer'] = true;
                    return ApiProvider.getProduct(item, ApiProvider.getUser(item['author'], item['author']));
                });
                this.counts.near = resp['offers'].length;
            });
        }).catch(err => {});
        this.prices = MyApp.prices;
    }

    showList(offers: string|Array<{}>, count:Number = 0, title:string = 'Moje sledované') {
        this.navCtrl.push(OfferListPage, {
            offers: offers,
            count: count,
            title: title,
            favs: true
        });
    }

    openMap() {
        this.navCtrl.push(MapPage);
    }
}
