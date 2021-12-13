import { auto } from 'eol';

export class Newline {
    generate(input: string | undefined){
        return auto(String(input));
    }
}