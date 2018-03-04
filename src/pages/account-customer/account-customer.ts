import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Data} from "../../app/Entity/Data";
import {FileTransfer} from "@ionic-native/file-transfer";
import {RegionAutocompleteProvider} from "../../providers/region-autocomplete/region-autocomplete";
import {FormControl, FormGroup} from "@angular/forms";
import {Storage} from "@ionic/storage";

/**
 * Generated class for the AccountCustomerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-account-customer',
    templateUrl: 'account-customer.html',
})
export class AccountCustomerPage {

    private data = {
        '0': {
            NeoShopAddress: {
                address: MyApp.loggedUser.street,
                city: MyApp.loggedUser.city,
                region_id: MyApp.loggedUser.region,
                zip: MyApp.loggedUser.zip,
                name: MyApp.loggedUser.scopeExtra['name']
            }
        },
        NeoShopUser: {
            name: MyApp.loggedUser.name,
            description: MyApp.loggedUser.description,
            photo: MyApp.loggedUser.avatar,
            region_id: MyApp.loggedUser.region,
            city: MyApp.loggedUser.city,
            zip: MyApp.loggedUser.zip,
            phone: MyApp.loggedUser.scopeExtra['phone']
        }
    };

    avatar: string;

    account: FormGroup;
    regionImage: string;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public api: ApiProvider,
                private alertCtrl: AlertController,
                private transfer: FileTransfer,
                public regionsAutocmp: RegionAutocompleteProvider,
                private storage: Storage) {
        this.avatar = this.data.NeoShopUser.photo;
        this.account = new FormGroup({
            city: new FormControl(this.data[0].NeoShopAddress.city)
        });
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[this.data.NeoShopUser.region_id - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
    }

    showAlert(success) {
        const alert = this.alertCtrl.create({
            title: success ? 'Informácie uložené' : 'Chyba',
            subTitle: success ? 'Informácie boli uložené' : 'Informácie neboli uložené, skúste to znova neskôr.',
            buttons: ['OK']
        });
        alert.present();
    }

    saveData() {
        this.data[0].NeoShopAddress.city = this.data.NeoShopUser.city = this.account.value.city;
        let village = Data.villages.find(item => {
            console.log(item['fullname'], this.data.NeoShopUser.city );
            return item['fullname'] == this.data.NeoShopUser.city;
        });
        this.data.NeoShopUser.region_id = village['region_id'];
        this.data[0].NeoShopAddress.zip = this.data.NeoShopUser.zip = village['zip'].toString();
        this.api.editUser(this.data).then(response => {
            MyApp.loggedUser.name = this.data.NeoShopUser.name;
            MyApp.loggedUser.description = this.data.NeoShopUser.description;
            MyApp.loggedUser.avatar = this.data.NeoShopUser.photo;
            MyApp.loggedUser.region = this.data[0].NeoShopAddress.region_id;
            MyApp.loggedUser.city = this.data[0].NeoShopAddress.city;
            this.showAlert(response['status']);
            MyApp.loggedUser = ApiProvider.getUser(this.data, this.data);
            this.storage.set('loggedUser', MyApp.loggedUser);

            this.api.getFavouriteOffers(MyApp.loggedUser.id).then(response => {
                MyApp.loggedUser = ApiProvider.getUser(response['loggedInUser'], response['loggedInUser'])
            });

        });
    }

    uploadPhotos(evt) {

        let ft = this.transfer.create();
        for (let i = 0; i < evt.target.files.length; i++) {
            let file = evt.target.files[i];
            let reader = new FileReader();
            reader.onload = event => {
                let bs = event.target['result'];
                this.api.uploadBase64(btoa(bs), 'NeoShopUser', MyApp.loggedUser.scopeId).then(data => {
                    this.data.NeoShopUser.photo = this.avatar = ApiProvider.URL + data['path'];
                });
            };
            reader.readAsBinaryString(file);
        }
    }

    regionSelect() {
        this.data.NeoShopUser.city = this.data[0].NeoShopAddress.city = this.account.value.city;
        let village = Data.villages.find(item => {
            return item['fullname'] == this.data.NeoShopUser.city;
        });
        this.data.NeoShopUser.region_id = village['region_id'];
        this.data.NeoShopUser.zip = village['zip'].toString();
        this.data.NeoShopUser.zip = this.data.NeoShopUser.zip === '0' ? '' : this.data.NeoShopUser.zip;
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[this.data.NeoShopUser.region_id - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
    }

}
