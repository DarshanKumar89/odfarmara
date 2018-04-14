import {Component, Input, Pipe} from '@angular/core';
import {User} from "../../app/Entity/User";
import {Message} from "../../app/Entity/Message";
import {Demand} from "../../app/Entity/Demand";
import {ConversationPage} from "../../pages/conversation/conversation";
import {AlertController, NavController} from "ionic-angular";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {PipesModule} from "../../pipes/pipes.module";

/**
 * Generated class for the MessageComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'message',
    templateUrl: 'message.html'
})
export class MessageComponent {
    @Input() message: {message: Message, opponent: User, idDemand?: number};
    idDemand: number = undefined;
    @Input() conversations: Array<{message: Message, opponent: User, idDemand?: number}>;
    constructor(private navCtrl: NavController, private api: ApiProvider, private alert: AlertController) {
    }

    openConversation(idUser, conversation: {message: Message, opponent: User, idDemand?: number}) {
        let msg: Message = conversation.message;
        this.idDemand = conversation.idDemand;
        if (msg) {
            msg.seen = true;
        }
        this.navCtrl.push(ConversationPage, {
            idUser: idUser,
            idDemand: this.idDemand
        });
    }

    deleteConversation(conversation: {message: Message, opponent: User, idDemand?: number}) {
        if(!this.idDemand) {
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
                this.conversations = this.conversations.filter((item: {message: Message, opponent: User, idDemand?: number}) => {
                    if(item.idDemand) {
                        return true;
                    }
                    return item.opponent.id != (conversation.opponent.id);
                });
                MyApp.counts.messages--;
            });
        } else {
            this.api.get('/neo_content/neo_content_demand/delete/' + this.idDemand).then(item => {
                this.alert.create({
                    title: 'Vymazané',
                    message: 'Dopyt bol vymazaný.',
                    buttons: ['OK']
                }).present();
                this.conversations = this.conversations.filter(message => {
                    return message.idDemand != this.idDemand;
                });
                MyApp.counts.demands--;
            });

        }
    }
}
