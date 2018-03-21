import {Component, Input} from '@angular/core';
import {ApiProvider} from "../../providers/api/api";
import {MyApp} from "../../app/app.component";

/**
 * Generated class for the BtnFavouritesComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
    selector: 'btn-favourites',
    templateUrl: 'btn-favourites.html'
})
export class BtnFavouritesComponent {

    @Input() state: boolean;
    @Input() block: boolean;
    @Input() idProduct: number;

    constructor(public api: ApiProvider) {
    }

    addToFav() {
        this.state = !this.state;
        this.api.post('/neo_shop/neo_shop_users/favourite/' + this.idProduct, {}, MyApp.loggedUser.id).then(data => {
            this.state = data['like'] == 1;
        });
    }
}
