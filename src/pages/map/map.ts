import {Component, NgZone, Pipe} from '@angular/core';
import {Events, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {Geolocation} from "@ionic-native/geolocation";
import {ProfileFarmerPage} from "../profile-farmer/profile-farmer";
import {Storage} from "@ionic/storage";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {MyApp} from "../../app/app.component";
import {Network} from "@ionic-native/network";
import {User} from "../../app/Entity/User";

/**
 * Generated class for the MapPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-map',
    templateUrl: 'map.html',
})
export class MapPage extends Wrapper {
    area: number = 0;
    url;
    rurl;
    farmers = [];
    len = 0;
    page = 0;
    loading = 0;
    showMap = true;

    constructor(public navParams: NavParams,
                public navCtrl: NavController,
                public sanitizer: DomSanitizer,
                public geolocation: Geolocation,
                public api: ApiProvider,
                public events: Events,
                private storage: Storage,
                private network: Network,
                private zone: NgZone) {
        super(navCtrl, navParams, sanitizer);
        this.url = this.sanitizeURL('https://odfarmara.sk/sub_page/apiMap');
        this.farmers = [];
        this.load();
        this.storage.get('radius').then(radius => {
            this.area = isNaN(parseInt(radius)) ? 20 : parseInt(radius);
        });
        setInterval(() => {
            this.load();
        }, 1000 * 60 * 5);
        this.events.subscribe('updateScreen', () => {
            this.zone.run(() => {
            });
        });
        this.network.onDisconnect().subscribe(() => {
            this.showMap = false;
        });
        this.network.onConnect().subscribe(() => {
            this.showMap = true;
        });
    }

    load() {
        if(this.geolocation) {
            this.geolocation.getCurrentPosition().then(resp => {
                this.setup(`&lat=${resp.coords.latitude}&lng=${resp.coords.longitude}`);
            }).catch(resp => {
                this.storage.get('lastPos').then(item => {
                    this.setup(`&lat=${item.lat}&lng=${item.lng}`);
                }).catch(() => {
                    this.setup();
                });
            });
        } else {
            this.setup();
        }
    }

    setup(url = '') {
        let t = new Date().getTime() + Math.random() * 1000;
        if(url != this.rurl) {
            this.rurl = url;
            let baseURL = ApiProvider.URL;
            this.url = this.sanitizeURL(`${baseURL}/sub_page/apiMap?t=${t}${this.rurl}&radius=${this.area}`);
        }
        url += `&page=${this.page}`;
        this.api.get(`/sub_page/apiMap?t=${t}${url}`, {}, true).then(response => {
            response['farms'].filter(item => {
                return item.User.active === '1';
            }).map(item => {
                item['isFarmer'] = true;
                let user = ApiProvider.getUser(item, item);
                this.farmers.push(user);
                return user;
            });
            this.len = response['countFarmers'];
            this.loading = 0;
            this.events.publish('updateScreen')
        });
    }

    calc(rating) {
        let stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push('<span class="fa fa-star' + (i >= Math.round(rating) ? '-o' : '') + '"></span>');
        }
        return stars;
    }

    isElementInViewPort(element: HTMLElement, viewPortHeight: number) {
        let rect = element.getBoundingClientRect();
        return rect.top >= 0 && (rect.bottom <= viewPortHeight);
    }

    scroll(e) {
        if (this.loading == 0) {
            let top = e.scrollTop;
            let height = e.scrollHeight;
            let bottom = document.getElementById('bottom');
            if (top + height + 10 >= bottom.offsetTop) {
                this.loading = 1;
                this.page++;
                this.setup(this.rurl);
            }
        }
    }

    openFarmer(user) {
        this.navCtrl.push(ProfileFarmerPage, {
            id: user.scopeId
        });
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    };
}
