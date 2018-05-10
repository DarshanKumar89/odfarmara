import {Component, ViewChild} from '@angular/core';
import {AlertController, Content, NavController, NavParams} from 'ionic-angular';
import {Message} from "../../app/Entity/Message";
import {User} from "../../app/Entity/User";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {ConversationPage} from "../conversation/conversation";
import {Demand} from "../../app/Entity/Demand";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

/**
 * Generated class for the MessagesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html',
})
export class MessagesPage {
    @ViewChild(Content) content: Content;
    private conversations = Array<{message: Message, opponent: User, idDemand?: number}|Demand>();

    private counts;

    loaded = false;
    mLoaded = false;
    dLoaded = false;
    me = MyApp.loggedUser;

    constructor(public navCtrl: NavController, public navParams: NavParams, private api: ApiProvider, private alert: AlertController) {
        this.counts = {
            messages: 0
        };
        api.getMessages(MyApp.loggedUser.id).then(data => {
            this.conversations = Object.keys(data['messages']).filter(key => {
                return key != '';
            }).map(key => {
                let user = data['messages'][key]['UserFrom']['User']['id'] == MyApp.loggedUser.id ? data['messages'][key]['UserTo'] : data['messages'][key]['UserFrom'];
                user['isFarmer'] = typeof user['NeoContentFarmersProfile'] !== 'undefined';
                return {
                    opponent: ApiProvider.getUser(user, user),
                    message: ApiProvider.getMessage(data['messages'][key])
                };
            }).sort((a: Demand|{message: Message, opponent: User, idDemand?: number}, b: Demand|{message: Message, opponent: User, idDemand?: number}) => {
                return (a instanceof Demand ? a.lastMessage : a.message).created.getTime() > (b instanceof Demand ? b.lastMessage : b.message).created.getTime() ? -1 : 1;
            });
            this.mLoaded = true;
            this.loaded = this.mLoaded && this.dLoaded;
        });
        this.api.getDemands(MyApp.loggedUser.id).then(data => {
            data['demands'].map(item => {
                this.api.fetchDemand(item['NeoContentDemand']['id_demand']).then(response => {
                    this.conversations.push(ApiProvider.getDemand(response['demand'], response['messages'], ApiProvider.getProduct(response['offer']), ApiProvider.getUser(response['opponent'], response['opponent'])));
                    this.conversations.sort((a: Demand|{message: Message, opponent: User, idDemand?: number}, b: Demand|{message: Message, opponent: User, idDemand?: number}) => {
                        return (a instanceof Demand ? a.lastMessage : a.message).created.getTime() > (b instanceof Demand ? b.lastMessage : b.message).created.getTime() ? -1 : 1;
                    });
                    if(this.conversations.filter(item => {
                        return item instanceof Demand;
                    }).length === data['demands'].length) {
                        this.dLoaded = true;
                    }
                    this.loaded = this.mLoaded && this.dLoaded;
                });
            });
            //MyApp.counts.demands = data['demands'].length;
            this.counts = MyApp.counts;
        });
    }

    openConversation(idUser, conversation: {message: Message, opponent: User, idDemand?: number}|Demand) {
        let msg: Message = conversation instanceof Demand ? conversation.lastMessage : conversation.message;
        if(msg) {
            msg.seen = true;
        }
        let idDemand = undefined;
        if(conversation instanceof Demand) {
            idDemand = conversation.id;
        }
        this.navCtrl.push(ConversationPage, {
            idUser: idUser,
            idDemand: idDemand
        });
    }

    deleteConversation(conversation: {message: Message, opponent: User, idDemand?: number}) {
        this.api.post('/neo_content/neo_content_inbox/delete/' + (conversation.opponent.id), {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(() => {
            this.alert.create({
                title: 'Vymazané',
                message: 'Konverzácia bola vymazaná.',
                buttons: ['OK']
            }).present();
            this.conversations = this.conversations.filter((item: {message: Message, opponent: User, idDemand?: number}|Demand) => {
                if(item instanceof Demand) {
                    return true;
                }
                return item.opponent.id != (conversation.opponent.id);
            });
            MyApp.counts.messages--;
        });
    }

    deleteDemand(message: Demand) {
        this.alert.create({
            title: 'Vymazané',
            message: 'Dopyt bol vymazaný.',
            buttons: ['OK']
        }).present();
        this.conversations = this.conversations.filter((item: {message: Message, opponent: User, idDemand?: number}|Demand) => {
            if(!(item instanceof Demand)) {
                return true;
            }
            return item.id != message.id;
        });
        this.api.get('/neo_content/neo_content_demand/delete/' + message.id).then(item => {

        });
    }

    isDemand(message: { message: Message; opponent: User } | Demand) {
        return message instanceof Demand;
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
