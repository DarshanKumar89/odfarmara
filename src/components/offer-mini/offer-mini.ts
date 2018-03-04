import {Component, Input} from '@angular/core';
import {NavController, NavParams} from "ionic-angular";
import {Product} from "../../app/Entity/Product";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";

/**
 * Generated class for the OfferMiniComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
    selector: 'offer-mini',
    templateUrl: 'offer-mini.html',
})
export class OfferMiniComponent extends Wrapper {

    @Input() product: Product;

    constructor(public navCtrl: NavController, public navParams: NavParams, protected sanitizer: DomSanitizer) {
        super(navCtrl, navParams, sanitizer);
    }

    showProduct(product: Product) {
        this.navCtrl.push(ProductDetailPage, {
            product: product
        })
    }
}
