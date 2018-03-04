import {Component, Input} from '@angular/core';
import {MyApp} from "../../app/app.component";
import {Data} from "../../app/Entity/Data";

/**
 * Generated class for the RegionSelectComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'region-select',
  templateUrl: 'region-select.html'
})
export class RegionSelectComponent {
  @Input() region: number;
  @Input() city: number;
  @Input() id: string;
  private regions;
  private villages;
  private cityObj;
  private regionObj;
  private image;

  constructor() {
    this.regions = MyApp.regions;
    this.villages = Data.villages;
    if(this.city == null) {
      this.city = this.villages[0].id;
    }
    this.cityObj = this.villages[this.city - 1];
    if(this.region == null) {
      this.region = this.regions[this.cityObj.region_id - 1].id;
    }
    this.regionObj = this.regions[this.region - 1];
    this.image = `https://odfarmara.sk/theme/Odfarmara/img/${this.regionObj.image}`;
    MyApp.componentData.city = this.city;
    MyApp.componentData.region = this.region;
  }

  updateImage() {
      this.cityObj = this.villages[this.city - 1];
      this.region = this.cityObj.region_id;
      this.regionObj = this.regions[this.region - 1];
      this.image = `https://odfarmara.sk/theme/Odfarmara/img/${this.regionObj.image}`;
      MyApp.componentData.city = this.city;
      MyApp.componentData.region = this.region;
  }

}
