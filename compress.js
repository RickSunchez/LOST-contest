class NumSerial {
    constructor() {
        this.controlCodes = [33, 34, 35, 36].map((code)=>String.fromCharCode(code));
        this.forward = {};
        this.backward = {};

        this.__alphabetsSet();
    }

    compress(arr) {
        arr.sort((a, b) => a - b);
        var out = this.forward[arr[0]];

        for (let i in arr) {
            if (i == 0) continue;

            let code = arr[i] - arr[i-1];
            out += this.forward[code];
        }

        return out;
    }

    decompress(str) {
        var i = 0;
        var out = [];

        while (i < str.length) {
            let decode = str[i];
            i++;
            if (this.controlCodes.indexOf(decode) > -1) {
                decode += str[i];
                i++;
            }

            let value = this.backward[decode];

            out.push(value);

            if (out.length > 1) {
                let l = out.length-1;
                out[l] += out[l-1];
            }
        }

        return out;
    }

    __alphabetsSet() {
        var charCode = 37;
        var ci = -1;

        for (let i=0; i<=300; i++) {
            let sfcc = this.__s(charCode);
            if (ci > -1) sfcc = this.controlCodes[ci] + sfcc;

            this.forward[i] = sfcc;
            this.backward[sfcc] = i;

            charCode++;
            if (charCode > 126) {
                ci++;
                charCode = 37;
            }
        }
    }

    __s(code) {
        return String.fromCharCode(code)
    }
}

class Test {
    constructor(arr) { 
        this.a = arr; 
        this.ns = new NumSerial();
    }

    test(pref="") {
        console.log("Source string:");
        console.log(JSON.stringify([...this.a]));

        console.log("Compressed string:");
        console.log(this.ns.compress([...this.a]));

        console.log(pref + "Accordance:", this.__elementsTest());
        console.log(pref + "Compress rate:");
        console.log(pref + this.__compressRate());
    }

    __elementsTest() {
        var sourceArr = [...this.a];
        sourceArr.sort((a, b) => a - b);

        var nsArr = this.ns.decompress(this.ns.compress([...this.a]));

        for (let i in sourceArr)
            if (sourceArr[i] != nsArr[i]) return false;
    
        return true;
    }

    __compressRate() {
        var sourceLength = JSON.stringify([...this.a]).length;
        var compressLength = this.ns.compress([...this.a]).length;

        return 100 - (compressLength / sourceLength) * 100;
    }
}

class Generator {
    random(count) {
        var out = [];
        for (let i=0; i<count; i++) 
            out.push(this.__randomInteger(1, 300))

        return out;
    }

    digits(count, digitCount) {
        var out = [];
        var bottom = (digitCount - 1) * 10;
        var top = digitCount * 10 - 1;

        bottom = (bottom == 0) ? 1 : bottom;

        for (let i=0; i<count; i++)
            out.push(this.__randomInteger(bottom, top))
            
        return out;
    }

    special() {
        var out = [];

        for (let i=1; i<=300; i++)
            out.push(i, i, i);

        return out;
    }

    __randomInteger(min, max) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
}

tests = [50, 100, 500, 1000];
g = new Generator();

console.log("Tests");

for (let num of tests) {
    console.log("\nRandom test with", num, "values:");
    let t = new Test(g.random(num));
    t.test();

    console.log("\nDigits count test with", num, "values:");
    for (let j=1; j<=3; j++) {
        console.log("\n\twith", j, "digits:");
        t = new Test(g.digits(num, j));
        t.test("\t");
    }
}

console.log("\nSpecial test:")
let t = new Test(g.special());
t.test();
