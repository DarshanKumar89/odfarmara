import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import _ from "underscore";
import {ApiProvider} from "../../providers/api/api";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {ProfileFarmerPage} from "../profile-farmer/profile-farmer";

/**
 * Generated class for the ProductDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-product-detail',
    templateUrl: 'product-detail.html',
})
export class ProductDetailPage extends Wrapper {

    private product: Product;
    private demand = {quantity: 1};
    private prices;
    private isFav = false;
    private regions;
    private now = new Date();

    constructor(public navCtrl: NavController, public navParams: NavParams, protected sanitizer: DomSanitizer, api: ApiProvider) {
        super(navCtrl, navParams, sanitizer);
        this.product = this.navParams.get('product');
        this.prices = MyApp.prices;
        this.regions = MyApp.regions;
        MyApp.offer = this.product;
        MyApp.demandQty = 1;
        if(this.product instanceof Product) {
            if(this.product.author == null) {
                this.product.author = MyApp.emptyUser;
                api.get('/neo_content/neo_content_offers/view/' + this.product.id).then(response => {
                    this.product.author = ApiProvider.getUser(response, {"NeoContentAddress": {}});
                    MyApp.idDetailAuthor = this.product.author.id;
                });
            }
            MyApp.idDetailAuthor = this.product.author.id;
            _.forEach(MyApp.favourites, product => {
                if(product.id == this.product.id) {
                    this.isFav = true;
                }
            });
        } else {
            let id = this.product;
            this.product = new Product(
                0,
                MyApp.emptyUser,
                '',
                '',
                0,
                0,
                0,
                new Date,
                new Date,
                [],
                ''
            );
            api.post('/neo_content/neo_content_offers/view/' + id, {
                data: {
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                    }
                }
            }).then(response => {
                response['neoContentFarmer']['isFarmer'] = true;
                this.product = ApiProvider.getProduct(response['neoContentOffer'], ApiProvider.getUser(response['neoContentFarmer'], response['neoContentFarmer']));
                MyApp.idDetailAuthor = this.product.author.id;
            }).catch(e => {
                console.error(e);
            });
        }
    }


    calc(rating) {
        let stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push('<span class="fa fa-star' + (i >= Math.round(rating) ? '-o' : '') + '"></span>');
        }
        return stars;
    }

    decreaseQuantity() {
        if (this.demand.quantity > 1) {
            MyApp.demandQty = --this.demand.quantity;
        }
    }

    ionViewWillLeave() {
        MyApp.demandQty = 1;
        MyApp.offer = null;
    }

    increaseQuantity() {
        if (this.demand.quantity < this.product.quantity) {
            MyApp.demandQty = ++this.demand.quantity;
        }
    }

    openFarmer(id) {
        this.navCtrl.push(ProfileFarmerPage, {
            id: id
        });
    }


    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
