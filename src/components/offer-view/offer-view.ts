import {Component, Input} from '@angular/core';
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {DomSanitizer} from "@angular/platform-browser";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {OfferFormComponent} from "../offer-form/offer-form";
import {ApiProvider} from "../../providers/api/api";

/**
 * Generated class for the OfferViewComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
    selector: 'offer-view',
    templateUrl: 'offer-view.html'
})
export class OfferViewComponent extends Wrapper {
    @Input() product: Product;
    @Input() myOffers = false;
    prices = MyApp.prices;

    constructor(public navCtrl: NavController, public navParams: NavParams, protected sanitizer: DomSanitizer, public modalCtrl: ModalController, public api: ApiProvider, public alerts: AlertController) {
        super(navCtrl, navParams, sanitizer);
    }

    showProduct(product: Product) {
        this.navCtrl.push(ProductDetailPage, {
            product: this.product
        })
    }

    showEditProduct() {
        let offerForm = this.modalCtrl.create(OfferFormComponent, {
            product: new Product(
                this.product.id,
                this.product.author,
                this.product.name,
                this.product.description,
                this.product.price,
                this.product.priceType,
                this.product.quantity,
                this.product.validFrom,
                this.product.validUntil,
                this.product.photos,
                this.product.mainPhoto,
                this.product.category,
                this.product.qtyType
            )
        });
        offerForm.present();
    }

    deleteProduct(product: Product) {
        this.api.post('/neo_content/neo_content_offers/delete/' + product.id, {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(response => {
            if(response['success'] == 0) {
                this.alerts.create({
                    title: 'Ponuka nebola odstránená',
                    message: 'Niekde sa stala chyba',
                    buttons: ['OK']
                }).present();
            } else {
                this.alerts.create({
                    title: 'Ponuka odstránená',
                    message: 'Ponuka bola úspešne odstránená',
                    buttons: ['OK']
                }).present();
            }
            this.navCtrl.goToRoot({});
        });
    }

}
