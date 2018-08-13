import {Component} from '@angular/core';
import {AlertController, ModalController, NavController, NavParams} from 'ionic-angular';
import {User} from "../../app/Entity/User";
import {Message} from "../../app/Entity/Message";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {MyOffersPage} from "../my-offers/my-offers";
import {MessagesPage} from "../messages/messages";
import {OfferFormComponent} from "../../components/offer-form/offer-form";
import {ConversationPage} from "../conversation/conversation";
import {Demand} from "../../app/Entity/Demand";
import {AccountFarmerPage} from "../account-farmer/account-farmer";

/**
 * Generated class for the HomeFarmerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-home-farmer',
  templateUrl: 'home-farmer.html',
})
export class HomeFarmerPage {

    private conversations = Array<{message: Message, opponent: User, idDemand?: number}>();
    private counts = MyApp.counts;
    private me = MyApp.loggedUser;

    constructor(public navCtrl: NavController, public navParams: NavParams, private api: ApiProvider, private modalCtrl: ModalController, public alerts: AlertController) {
        if (this.navParams.get('immediatelyPush')) {
            this.navCtrl.push(this.navParams.get('immediatelyPush'));
        }
        api.getMessages(MyApp.loggedUser.id).then(data => {
            this.conversations = Object.keys(data['messages']).filter(key => {
                return key != '';
            }).map(key => {
                let user = data['messages'][key]['UserFrom']['User']['id'] == MyApp.loggedUser.id ? data['messages'][key]['UserTo'] : data['messages'][key]['UserFrom'];
                return {
                    opponent: ApiProvider.getUser(user, user),
                    message: ApiProvider.getMessage(data['messages'][key])
                };
            });
            this.conversations = this.conversations.sort((a, b) => {
                return a.message.seen ? 1 : -1;
            }).slice(0, 5);
            if(this.conversations.length < 5) {
                data['demands'].slice(0, 5 - this.conversations.length).map(item => {
                    this.api.fetchDemand(item['NeoContentDemand']['id_demand']).then(response => {
                        let dem = ApiProvider.getDemand(response['demand'], response['messages'], ApiProvider.getProduct(response['offer']), ApiProvider.getUser(response['opponent'], response['opponent']));
                        this.conversations.push({message: dem.lastMessage, opponent: dem.user, idDemand: dem.id});
                        this.conversations = this.conversations.sort((a, b) => {
                            return a.message.seen ? 1 : -1;
                        }).sort((a, b) => {
                            return a.message.created < b.message.created ? 1 : -1;
                        }).slice(0, 5);
                    });
                });
            }
            MyApp.counts.messages = this.counts.messages = this.conversations.length;
        });
    }

    openOfferFormModal() {
        let offerForm = this.modalCtrl.create(OfferFormComponent);
        offerForm.present();
    }

    showMyList() {
        this.navCtrl.push(MyOffersPage);
    }

    openMessages() {
        this.navCtrl.push(MessagesPage);
    }

    openConversation(idUser) {
        this.conversations = this.conversations.filter(item => {
            return item.opponent.id != idUser;
        });
        this.navCtrl.push(ConversationPage, {
            idUser: idUser
        });
    }

    deleteConversation(conversation: {message: Message, opponent: User, idDemand?: number}) {
        this.api.post('/neo_content/neo_content_inbox/delete/' + conversation.opponent.id, {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(() => {
            this.conversations = this.conversations.filter((item: {message: Message, opponent: User, idDemand?: number}) => {
                return item.opponent.id != conversation.opponent.id;
            });
            MyApp.counts.messages--;
        });
    }

    isDemand(message: { message: Message; opponent: User } | Demand) {
        return message instanceof Demand;
    }
}
