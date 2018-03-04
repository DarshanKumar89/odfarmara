import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import _ from "underscore";
import {ApiProvider} from "../../providers/api/api";

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

            api.post('/neo_content/neo_content_offers/view/' + this.product, {
                data: {
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                    }
                }
            }).then(response => {
                this.product = ApiProvider.getProduct(response['offer']);
                MyApp.idDetailAuthor = this.product.author.id;
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
}
