import {Component} from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {Demand} from "../../app/Entity/Demand";
import {ConversationPage} from "../conversation/conversation";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

/**
 * Generated class for the DemandsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-demands',
    templateUrl: 'demands.html',
})
export class DemandsPage {
    counts = {demands:0};

    loaded = false;
    conversations: Array<Demand> = [];
    constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, public alert: AlertController) {
        this.api.getDemands(MyApp.loggedUser.id).then(data => {
            data['demands'].map(item => {
                this.api.fetchDemand(item['NeoContentDemand']['id_demand']).then(response => {
                    this.conversations.push(ApiProvider.getDemand(response['demand'], response['messages'], ApiProvider.getProduct(response['offer']), ApiProvider.getUser(response['opponent'], response['opponent'])));
                    this.conversations = this.conversations.sort((a:Demand, b:Demand) => {
                        return a.lastMessage.created < b.lastMessage.created ? 1 : -1;
                    });
                });
            });
            //MyApp.counts.demands = data['demands'].length;
            this.counts = MyApp.counts;
            this.loaded = true;
        });
    }

    openConversation(idUser, idDemand) {
        this.navCtrl.push(ConversationPage, {
            idUser: idUser,
            idDemand: idDemand
        });
    }

    deleteDemand(id) {
        this.api.get('/neo_content/neo_content_demand/delete/' + id).then(item => {
            this.alert.create({
                title: 'Vymazané',
                message: 'Dopyt bol vymazaný.',
                buttons: ['OK']
            }).present();
            this.conversations = this.conversations.filter(demand => {
                return demand.id != id;
            })
        });
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeCustomerPage : HomeFarmerPage);
    }

}
