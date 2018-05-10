import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import _ from 'underscore';
import {Category} from "../../app/Entity/Category";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

/**
 * Generated class for the MyOffersPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-my-offers',
    templateUrl: 'my-offers.html',
})
export class MyOffersPage extends Wrapper {

    private offers = Array<Product>();
    private title;
    private prices;
    loaded = false;
    categorized = [];
    main = {};

    constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, public sanitizer: DomSanitizer) {
        super(navCtrl, navParams, sanitizer);
        this.prices = MyApp.prices;
        this.title = 'Moja ponuka';
        api.getMyOffers(MyApp.loggedUser.id).then(response => {
            this.loaded = true;
            this.offers = response['offers'].map(item => {
                if(item['NeoUploadFile'].length > 0) {
                    let tmp = item['NeoUploadFile'][0]['url'];
                    item['main'] = tmp['main'];
                }
                item['ParentNeoContentCategory'] = item['NeoContentCategoryParents'];
                let p = ApiProvider.getProduct(item, MyApp.loggedUser);
                if(p.category.parent) {
                    this.main[p.category.parent.id] = p.category.parent;
                } else {
                    this.main[0] = new Category(0, 'Nezaradené', '', null);
                }
                return p;
            });
            this.main = _.values(this.main);
            for(let i = 0; i < this.offers.length; i++) {
                let offer = this.offers[i];
                let c = _.find(this.categorized, cat => {
                    return cat.category.id == offer.category.parent.id;
                });
                if(!c) {
                    let cat = {category: offer.category.parent, products: [offer]};
                    this.categorized.push(cat);
                } else {
                    c.products.push(offer);
                }
            }
            //this.categorized = _.indexBy(this.offers, 'idp');
        });
    }


    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
