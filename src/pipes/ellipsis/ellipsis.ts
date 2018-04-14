import {Pipe, PipeTransform} from '@angular/core';

/**
 * Generated class for the EllipsisPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
    /**
     * Takes a value and makes it lowercase.
     */
    transform(value: string, ...args) {
        let result = value.trim().replace(/\s+/g, ' ').split(' ').slice(0, args.length > 0 ? parseInt(args[0]) : 10).join(' ');
        return result == value ? result : `${result}...`;
    }
}
