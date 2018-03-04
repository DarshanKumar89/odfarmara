import {_} from 'underscore';
import {Component, Pipe} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {MyApp} from "../../app/app.component";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {ApiProvider} from "../../providers/api/api";
import {Data} from "../../app/Entity/Data";
import {FileTransfer} from "@ionic-native/file-transfer";
import {FormControl, FormGroup} from "@angular/forms";
import {RegionAutocompleteProvider} from "../../providers/region-autocomplete/region-autocomplete";
import {Storage} from "@ionic/storage";

/**
 * Generated class for the AccountPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-account-farmer',
    templateUrl: 'account-farmer.html',
})
export class AccountFarmerPage extends Wrapper {

    data = {
        NeoContentFarmersProfile: {
            name: MyApp.loggedUser.name,
            region_id: MyApp.loggedUser.region,
            contact_name: MyApp.loggedUser.person,
            short_description: MyApp.loggedUser.description,
            address: MyApp.loggedUser.street,
            city: MyApp.loggedUser.city,
            zip: MyApp.loggedUser.zip,
            photo: MyApp.loggedUser.avatar,
            cover: MyApp.loggedUser.poster,
            opening_hours: MyApp.loggedUser.scopeExtra['opening_hours'],
            post_send: MyApp.loggedUser.scopeExtra['post_send'],
            phone: MyApp.loggedUser.scopeExtra['phone'],
            package_type: MyApp.loggedUser.scopeExtra['package_type'],
        }
    };

    translated = {
        monday: 'Pondelok',
        tuesday: 'Utorok',
        wednesday: 'Streda',
        thursday: 'Štvrtok',
        friday: 'Piatok',
        saturday: 'Sobota',
        sunday: 'Sunday',
    };

    _ = _;

    hourKeys;

    avatar: string;
    poster: string;
    account: FormGroup;
    regionImage: string;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                sanitizer: DomSanitizer,
                private alertCtrl: AlertController,
                public api: ApiProvider,
                private transfer: FileTransfer,
                public regionsAutocmp: RegionAutocompleteProvider,
                private storage: Storage) {
        super(navCtrl, navParams, sanitizer);

        this.account = new FormGroup({
            city: new FormControl(this.data.NeoContentFarmersProfile.city)
        });
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[this.data.NeoContentFarmersProfile.region_id - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
        this.hourKeys = Object.keys(this.data.NeoContentFarmersProfile.opening_hours);

        this.api.getFavouriteOffers(MyApp.loggedUser.id).then(response => {
            MyApp.loggedUser = ApiProvider.getUser(response['loggedInUser'], response['loggedInUser'])
        });

        this.avatar = MyApp.loggedUser.avatar;
        this.poster = MyApp.loggedUser.poster;
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

        this.api.editUser(this.data).then(response => {
            MyApp.loggedUser.name = this.data.NeoContentFarmersProfile.name;
            MyApp.loggedUser.description = this.data.NeoContentFarmersProfile.short_description;
            MyApp.loggedUser.avatar = this.data.NeoContentFarmersProfile.photo;
            MyApp.loggedUser.region = this.data.NeoContentFarmersProfile.region_id;
            MyApp.loggedUser.city = this.data.NeoContentFarmersProfile.city;
            MyApp.loggedUser.person = this.data.NeoContentFarmersProfile.contact_name;
            MyApp.loggedUser.street = this.data.NeoContentFarmersProfile.address;
            MyApp.loggedUser.zip = this.data.NeoContentFarmersProfile.zip;
            MyApp.loggedUser.avatar = this.avatar;
            MyApp.loggedUser.poster = this.poster;
            this.showAlert(response['status']);
            MyApp.loggedUser = ApiProvider.getUser(this.data, this.data);
            this.storage.set('loggedUser', MyApp.loggedUser);
        });
    }

    uploadPhotos(evt, type) {

        let ft = this.transfer.create();
        for (let i = 0; i < evt.target.files.length; i++) {
            let file = evt.target.files[i];
            let reader = new FileReader();
            reader.onload = event => {
                let bs = event.target['result'];
                this.api.uploadBase64(btoa(bs), 'NeoContentFarmersProfile', MyApp.loggedUser.scopeId).then(data => {
                    if(type === 'avatar') {
                        this.data.NeoContentFarmersProfile.photo = data['id'];
                        this.avatar = ApiProvider.URL + data['path'];
                    } else {
                        this.data.NeoContentFarmersProfile.cover = data['id'];
                        this.poster = ApiProvider.URL + data['path'];
                    }
                });
            };
            reader.readAsBinaryString(file);
        }
    }

    regionSelect() {
        this.data.NeoContentFarmersProfile.city = this.account.value.city;
        let village = Data.villages.find(item => {
            return item['fullname'] == this.data.NeoContentFarmersProfile.city;
        });
        this.data.NeoContentFarmersProfile.region_id = village['region_id'];
        this.data.NeoContentFarmersProfile.zip = village['zip'].toString();
        this.data.NeoContentFarmersProfile.zip = this.data.NeoContentFarmersProfile.zip === '0' ? '' : this.data.NeoContentFarmersProfile.zip
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[this.data.NeoContentFarmersProfile.region_id - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
    }
}
