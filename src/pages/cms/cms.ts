import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";

/**
 * Generated class for the CmsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-cms',
    templateUrl: 'cms.html',
})
export class CmsPage {

    page: { id: number, title: string, component: any, content: string, slug: string };

    constructor(public navCtrl: NavController, public navParams: NavParams, private provider: ApiProvider) {
        this.page = this.navParams.data.page;
        this.provider.getCmsPage(this.page.id, this.page.slug).then((response) => {
            this.page.content = response['content']
                .replace(/(<a\s)/g, '<a target="_system" ')
                .replace(/href="\/(.+)"/g, 'href="https://odfarmara.sk/$1"')
                .replace('$countFarmers', 0)
                .replace('$countClients', 0)
                .replace('$countOrders', 0)
        });
    }

}
