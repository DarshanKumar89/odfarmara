import {NgModule} from '@angular/core';
import {RemovehtmltagsPipe} from './removehtmltags/removehtmltags';
import { EllipsisPipe } from './ellipsis/ellipsis';

@NgModule({
    declarations: [
        RemovehtmltagsPipe,
        EllipsisPipe
    ],
    imports: [],
    exports: [
        RemovehtmltagsPipe,
        EllipsisPipe
    ]
})
export class PipesModule {
}
