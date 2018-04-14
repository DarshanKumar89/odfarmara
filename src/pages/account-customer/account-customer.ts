import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Data} from "../../app/Entity/Data";
import {FileTransfer} from "@ionic-native/file-transfer";
import {RegionAutocompleteProvider} from "../../providers/region-autocomplete/region-autocomplete";
import {FormControl, FormGroup} from "@angular/forms";
import {Storage} from "@ionic/storage";
import {Camera} from "@ionic-native/camera";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

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
    loading = false;
    private data = {
        '0': {
            NeoShopAddress: {
                address: MyApp.loggedUser.street,
                city: MyApp.loggedUser.city,
                region_id: MyApp.loggedUser.region,
                zip: MyApp.loggedUser.zip,
                name: MyApp.loggedUser.scopeExtra['name'],
                id: MyApp.loggedUser.scopeExtra['idAddress'],
            }
        },
        NeoShopUser: {
            name: MyApp.loggedUser.name,
            description: MyApp.loggedUser.description,
            photo: MyApp.loggedUser.avatar,
            region_id: MyApp.loggedUser.region,
            city: MyApp.loggedUser.city,
            zip: MyApp.loggedUser.zip,
            address: MyApp.loggedUser.street,
            phone: MyApp.loggedUser.scopeExtra['phone']
        },
        NeoUploadFile: [
            {
                url: {
                    main: MyApp.loggedUser.avatar
                }
            }
        ]
    };

    avatar: string;

    account: FormGroup;
    regionImage: string;
    zip: string;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public api: ApiProvider,
                private alertCtrl: AlertController,
                private transfer: FileTransfer,
                public regionsAutocmp: RegionAutocompleteProvider,
                private camera: Camera,
                private alert: AlertController,
                private storage: Storage) {
        this.avatar = this.data.NeoShopUser.photo;
        this.zip = MyApp.loggedUser.zip;
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
            return item['fullname'] == this.data.NeoShopUser.city;
        });
        this.data.NeoShopUser.region_id = village ? village['region_id'] : 0;
        this.data[0].NeoShopAddress.zip = this.data.NeoShopUser.zip = (this.zip != '' ? this.zip : village ? village['zip'].toString() : '');
        this.data[0].NeoShopAddress.city = this.data.NeoShopUser.city;
        this.data[0].NeoShopAddress.address = this.data.NeoShopUser.address;
        this.api.editUser(this.data).then(response => {
            MyApp.loggedUser.name = this.data.NeoShopUser.name;
            MyApp.loggedUser.description = this.data.NeoShopUser.description;
            MyApp.loggedUser.avatar = this.avatar;
            this.data.NeoUploadFile[0].url.main = this.avatar;
            MyApp.loggedUser.region = this.data[0].NeoShopAddress.region_id;
            MyApp.loggedUser.city = this.data[0].NeoShopAddress.city;
            this.showAlert(response['status']);
            this.data['User'] = response['loggedUser']['User'];
            this.data['isFarmer'] = false;
            MyApp.loggedUser = ApiProvider.getUser(this.data, this.data[0]);
            this.storage.set('loggedUser', MyApp.loggedUser);
        });
    }

    choosePhoto() {
        let alert = this.alert.create({
            title: 'Vyberte spôsob',
            message: 'Vyberte, ktorým chcete vybrať obrázky.',
            buttons: [
                {
                    text: 'Fotoaparát',
                    handler: () => {
                        this.getPhoto(1)
                    }
                },
                {
                    text: 'Galéria',
                    handler: () => {
                        this.getPhoto(0)
                    }
                }
            ]
        });
        alert.present();
    }

    private getPhoto(srcType: number) {
        this.camera.getPicture({
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true,
            sourceType: srcType,
        }).then(img => {
            this.uploadPhotos(img);
        }).catch(e => {
            console.error(e);
        });
    }

    uploadPhotos(bs) {

        let ft = this.transfer.create();
        this.api.uploadBase64(bs, 'NeoShopUser', MyApp.loggedUser.scopeId).then(data => {
            this.avatar = ApiProvider.URL + data['path'];
            this.data.NeoShopUser.photo = data['id'];
        });
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

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }

}
