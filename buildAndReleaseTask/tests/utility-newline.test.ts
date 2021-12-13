import { Newline } from '../utility/newline';

describe('#newline()', function () {
    it('should return a multiline string with \\n', function () {
        
var input = `Line1
Line2`;

        let result = new Newline().generate(input);

        expect(result).toBe("Line1\r\nLine2");
    });
});