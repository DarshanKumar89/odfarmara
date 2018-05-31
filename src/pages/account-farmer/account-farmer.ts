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
import {Camera} from "@ionic-native/camera";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import { NgZone  } from '@angular/core';
import { Events } from 'ionic-angular';

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

    data;

    translated = {
        monday: 'Pondelok',
        tuesday: 'Utorok',
        wednesday: 'Streda',
        thursday: 'Štvrtok',
        friday: 'Piatok',
        saturday: 'Sobota',
        sunday: 'Nedeľa',
    };

    _ = _;

    hourKeys;

    avatar: string;
    poster: string;
    account: FormGroup;
    regionImage: string;
    loading = false;
    zip: string;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                sanitizer: DomSanitizer,
                private alertCtrl: AlertController,
                public api: ApiProvider,
                private transfer: FileTransfer,
                public regionsAutocmp: RegionAutocompleteProvider,
                private camera: Camera,
                private alert: AlertController,
                public events: Events,
                private zone: NgZone,
                private storage: Storage) {
        super(navCtrl, navParams, sanitizer);
        this.events.subscribe('updateScreen', () => {
            this.zone.run(() => {
                console.log('force update the screen');
            });
        });
        this.resetData();
    }

    resetData() {
        this.data = {
            NeoContentFarmersProfile: {
                id: MyApp.loggedUser.scopeId,
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
                post_send: MyApp.loggedUser.scopeExtra['post_send'] ? '1' : '0',
                phone: MyApp.loggedUser.scopeExtra['phone'],
                package_type: MyApp.loggedUser.scopeExtra['package_type'],
            }
        };
        this.account = new FormGroup({
            city: new FormControl(this.data.NeoContentFarmersProfile.city)
        });
        this.zip = MyApp.loggedUser.zip;
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[this.data.NeoContentFarmersProfile.region_id - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
        this.hourKeys = Object.keys(this.data.NeoContentFarmersProfile.opening_hours);
        if(this.hourKeys.length <= 1) {
            this.data.NeoContentFarmersProfile.opening_hours = {
                monday: ['', ''],
                tuesday: ['', ''],
                wednesday: ['', ''],
                thursday: ['', ''],
                friday: ['', ''],
                saturday: ['', ''],
                sunday: ['', ''],
            };
            this.hourKeys = Object.keys(this.data.NeoContentFarmersProfile.opening_hours);
        }

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
        if(this.zip != '' && this.zip != '0') {
            this.data.NeoContentFarmersProfile.zip = this.zip;
        }
        this.api.editUser(this.data).then(response => {
            //MyApp.loggedUser = ApiProvider.getUser(this.data, this.data);
            this.showAlert(response['status']);
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
            MyApp.loggedUser.scopeExtra['opening_hours'] = this.data.NeoContentFarmersProfile.opening_hours;
            MyApp.loggedUser.scopeExtra['post_send'] = this.data.NeoContentFarmersProfile.post_send == '1';
            MyApp.loggedUser.scopeExtra['phone'] = this.data.NeoContentFarmersProfile.phone;
            MyApp.loggedUser.scopeExtra['package_type'] = this.data.NeoContentFarmersProfile.package_type;
            MyApp.loggedUser.scopeId = this.data.NeoContentFarmersProfile.id;
            this.storage.set('loggedUser', MyApp.loggedUser);
            this.resetData();
        });
    }

    uploadPhotos(bs, type) {

        let ft = this.transfer.create();
        this.loading = true;
        this.api.uploadBase64(bs, 'NeoContentFarmersProfile', MyApp.loggedUser.scopeId).then(data => {
            this.loading = false;
            if(type === 'avatar') {
                this.data.NeoContentFarmersProfile.photo = data['id'];
                this.avatar = ApiProvider.URL + data['path'];
            } else {
                this.data.NeoContentFarmersProfile.cover = data['id'];
                this.poster = ApiProvider.URL + data['path'];
            }
            this.events.publish('updateScreen');
        });
    }

    choosePhoto(type) {
        let alert = this.alert.create({
            title: 'Vyberte spôsob',
            message: 'Vyberte, ktorým chcete vybrať obrázky.',
            buttons: [
                {
                    text: 'Fotoaparát',
                    handler: () => {
                        this.getPhoto(1, type)
                    }
                },
                {
                    text: 'Galéria',
                    handler: () => {
                        this.getPhoto(0, type)
                    }
                }
            ]
        });
        alert.present();
    }

    private getPhoto(srcType: number, type) {
        this.camera.getPicture({
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true,
            sourceType: srcType,
        }).then(img => {
            this.uploadPhotos(img, type);
        }).catch(e => {
            console.error(e);
        });
    }

    regionSelect() {
        this.data.NeoContentFarmersProfile.city = this.account.value.city;
        let village = Data.villages.find(item => {
            return item['fullname'] == this.data.NeoContentFarmersProfile.city;
        });
        this.data.NeoContentFarmersProfile.region_id = village['region_id'];
        this.data.NeoContentFarmersProfile.zip = village['zip'].toString();
        this.data.NeoContentFarmersProfile.zip = this.data.NeoContentFarmersProfile.zip === '0' ? '' : this.data.NeoContentFarmersProfile.zip;
        let img = 'https://odfarmara.sk/theme/Odfarmara/img/';
        let region = MyApp.regions[this.data.NeoContentFarmersProfile.region_id - 1];
        if(region) {
            this.regionImage = img + region['image'];
        }
    }

    applyForAll(day) {
        let openingHours = this.data.NeoContentFarmersProfile.opening_hours[day];
        for(let d in this.data.NeoContentFarmersProfile.opening_hours) {
            this.data.NeoContentFarmersProfile.opening_hours[d][0] = openingHours[0];
            this.data.NeoContentFarmersProfile.opening_hours[d][1] = openingHours[1];
        }
        this.hourKeys = [];
        this.hourKeys = Object.keys(this.data.NeoContentFarmersProfile.opening_hours);
    }

    parseInt(num) {
        return isNaN(parseInt(num)) ? 0 : parseInt(num);
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
