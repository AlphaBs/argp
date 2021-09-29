import * as _ from 'lodash';
import { ArgumentKeyValue, ArgumentParser } from "./argp";

import args1 from './args1.txt';
import '../style/style.css';

let argsTable1: HTMLElement = document.getElementById("args-table-1");
let txtArgStr: HTMLInputElement = document.getElementById("txtArgStr") as HTMLInputElement;
let btnResult: HTMLElement = document.getElementById("btnResult");

function showArgTable(argStr: string)
{
    //console.log(argStr);
    let parser = new ArgumentParser(argStr);
    let args = parser.parse();
    
    args.sort((a: ArgumentKeyValue, b: ArgumentKeyValue) => {
        if (a.key == null)
            return 1;
        else if (b.key == null)
            return -1;
        else if (a.key == null && b.key == null)
            return 0;
        else
            return a.key.localeCompare(b.key);
    });

    args.forEach(kv => {
        //console.log(`${kv.key} / ${kv.value}`);
        const tr = document.createElement('tr');
        const tdKey = document.createElement('td');
        const tdValue = document.createElement('td');

        if (kv.key)
            tdKey.innerText = kv.key;
        else
            tdKey.innerText = "(no value)";

        if (kv.value)
            tdValue.innerText = kv.value;
        else
            tdValue.innerText = "(no value)";

        console.log(`${kv.key} / ${kv.value}`);

        tr.appendChild(tdKey);
        tr.appendChild(tdValue);

        argsTable1.appendChild(tr);
    });
}

function btnResultOnClick()
{
    let argStr = txtArgStr.value;
    showArgTable(argStr);
}

btnResult.addEventListener('click', btnResultOnClick);
txtArgStr.innerText = args1;