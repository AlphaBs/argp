import { ArgumentParser } from './app/argp.js';
import * as promises from 'fs/promises';
//import args1 from './app/args1.txt';

async function main()
{
    let content = await promises.readFile("./src/app/args1.txt");
    let contentStr = content.toString()
    //let contentStr = args1;

    let parser = new ArgumentParser(contentStr);
    let result = parser.parse();

    result.forEach(kv => {
        console.log(`${kv.key} / ${kv.value}`);
    })
}

main();