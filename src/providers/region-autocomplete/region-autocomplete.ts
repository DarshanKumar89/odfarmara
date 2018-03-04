import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {AutoCompleteService} from "ionic2-auto-complete";
import {Data} from "../../app/Entity/Data";

/*
  Generated class for the RegionAutocompleteProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class RegionAutocompleteProvider implements AutoCompleteService {
    getResults(term: any): any {
        return Data.villages.slice().filter(item => {
            return item['fullname'].toLowerCase().startsWith(term.toLowerCase());
        }).map(item => {
            return item['fullname'];
        });
    }
}
