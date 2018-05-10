import { NgModule } from '@angular/core';
import { MessageComponent } from './message/message';
import { CustomImgComponent } from './custom-img/custom-img';
@NgModule({
	declarations: [MessageComponent,
    CustomImgComponent],
	imports: [],
	exports: [MessageComponent,
    CustomImgComponent]
})
export class ComponentsModule {}
