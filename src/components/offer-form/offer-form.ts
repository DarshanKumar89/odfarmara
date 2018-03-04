import {Component} from '@angular/core';
import {AlertController, NavController, NavParams, ViewController} from "ionic-angular";
import {Product} from "../../app/Entity/Product";
import {MyApp} from "../../app/app.component";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {ApiProvider} from "../../providers/api/api";
import _ from "underscore";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {FileTransfer} from "@ionic-native/file-transfer";

/**
 * Generated class for the OfferFormComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
    selector: 'offer-form',
    templateUrl: 'offer-form.html'
})
export class OfferFormComponent extends Wrapper {

    private product: Product;
    private types = [];
    private categories = [];
    private children = {};
    private subcategories = [];
    private offerForm;
    private errText = '';
    private nativeInputBtn;
    private future;
    private validFrom;
    private validUntil;
    private gallery = [];

    constructor(public viewCtrl: ViewController,
                public navCtrl: NavController,
                public navParams: NavParams,
                protected sanitizer: DomSanitizer,
                public api: ApiProvider,
                private transfer: FileTransfer,
                private alert: AlertController) {
        super(navCtrl, navParams, sanitizer);
        this.categories = MyApp.categories;
        this.children = MyApp.children;
        this.subcategories = this.children[this.categories[0] ? this.categories[0].id : 0];
        this.product = navParams.get('product');
        if(!this.product) {
            this.product = new Product(
                0, MyApp.loggedUser, '', '', 0,
                1, 0, new Date(), new Date(), [], '',
                null
            );
        } else {
            this.gallery = this.product.photos.slice().map(item => {
                return item['url']['main'];
            });
            this.product.photos = this.product.photos.map(item => {
                return item['id'];
            });
            console.log(this.product);
        }
        if(!this.product.category) {
            this.product.category = this.children[this.categories[0] ? this.categories[0].id : 0][0];
        }
        if(!this.product.category.parent) {
            this.product.category.parent = this.children[this.categories[0] ? this.categories[0].id : 0][0].parent;
        }
        for (let i in MyApp.prices) {
            if (MyApp.prices.hasOwnProperty(i)) {
                this.types.push({
                    index: i,
                    value: MyApp.prices[i]
                });
            }
        }
        let timeNow = new Date();
        this.future = new Date(timeNow.getTime() + 1000 * 60 * 60 * 24 * 365 * 2).getFullYear();
        this.validFrom = this.product.validFrom.toISOString();
        this.validUntil = this.product.validUntil.toISOString();
    }

    save() {
        let txt = '';
        this.product.validFrom = new Date(this.validFrom);
        this.product.validUntil = new Date(this.validUntil);
        if(this.product.name == '') {
            txt += "Vyplňte názov produktu.<br>";
        }
        if(this.product.description == '') {
            txt += "Vyplňte popis produktu.<br>";
        }
        if(this.product.price <= 0) {
            txt += "Vyplňte cenu produktu.<br>";
        }
        if(this.product.quantity <= 0) {
            txt += "Vyplňte množstvo produktu.<br>";
        }
        let today = new Date();
        today.setHours(0,0,0,0);
        if(this.product.validFrom < today) {
            txt += "Vyplňte správny dátum začiatku platnosti produktu.<br>";
        }
        if(this.product.validUntil < new Date) {
            txt += "Vyplňte správny dátum konca platnosti produktu.<br>";
        }
        if(this.product.photos.length == 0) {
            txt += "Nahrajte aspoň jednu fotku.<br>";
        }
        if(this.product.category.id == 0) {
            txt += "Vyberte kategóriu produktu.<br>";
        }
        this.errText = txt;
        if(txt == '') {
            let url = `/neo_content/neo_content_offers/${this.product.id == 0 ? 'add' : `edit/${this.product.id}`}`;
            this.api.post(url, {
                data: _.extend({
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                    }
                }, ApiProvider.getNeoProduct(this.product, MyApp.loggedUser))
            }).then(data => {
                this.product.id = data['insertId'];
                this.product['photos'] = this.gallery.map(item => {
                    return {
                        url: {
                            main: item
                        }
                    }
                });
                this.navCtrl.push(ProductDetailPage, {
                    product: this.product
                });
                this.closeModal();
                if(data['insertId']) {
                    this.alert.create({
                        title: 'Ponuka pridaná',
                        message: 'Ponuka bola úspešne pridaná. Počkajte na schválenie ponuky administrátorom.',
                        buttons: ['OK']
                    }).present();
                } else {
                    this.alert.create({
                        title: 'Ponuka upravená',
                        message: '',
                        buttons: ['OK']
                    }).present();
                }
            });
        }
    }

    categoryChange() {
        this.subcategories = this.children[this.product.category.parent.id];
    }

    deletePhoto(index) {
        this.product.photos.splice(index, 1);
        this.gallery.splice(index, 1);
    }

    deletePhotos() {
        this.product.photos = [];
        this.gallery = [];
    }

    closeModal() {
        this.viewCtrl.dismiss();
    }

    uploadPhotos(evt) {

        let ft = this.transfer.create();
        for(let i = 0; i < evt.target.files.length; i++) {
            let file = evt.target.files[i];
            let reader = new FileReader();
            reader.onload = event => {
                let bs = event.target['result'];
                this.api.uploadBase64(btoa(bs)).then(data => {
                    this.product.photos.push(data['id']);
                    this.gallery.push(ApiProvider.URL + data['path']);
                });
            };
            reader.readAsBinaryString(file);
        }
    }

}
