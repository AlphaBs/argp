function countChar(str: string, find: string): number
{
    return str.split(find).length - 1;
}

export interface ArgumentKeyValue
{
    key: string,
    value: string
}

export class ParseError extends Error
{
    position: number;

    constructor(pos: number)
    {
        super("parse error at " + pos);
        this.position = pos;
    }
}

export class ScopeStatus
{
    isEnded: boolean
    singleMarks: number
    doubleMarks: number

    constructor()
    {
        this.isEnded = false;
        this.singleMarks = 0;
        this.doubleMarks = 0;
    }
}

function checkScope(value: string, status: ScopeStatus)
{
    status.singleMarks += countChar(value, "'");
    status.doubleMarks += countChar(value, "\"");
    status.isEnded = status.singleMarks % 2 == 0 && status.doubleMarks % 2 == 0;
}

export class ArgumentParser
{
    constructor(args: string)
    {
        this.args = args;
        this.argSplit = args.split(' ');
        this.argIndex = 0;
    }

    args: string;
    argSplit: Array<string>;

    argIndex: number;

    peekNextArg(): string
    {
        return this.argSplit[this.argIndex];
    }

    getNextArg(): string
    {
        let arg = this.argSplit[this.argIndex];

        if (arg)
            this.argIndex += 1;

        return arg;
    }

    getArg(index: number): string
    {
        if (index >= this.argSplit.length)
            return null;
        return this.argSplit[index];
    }

    // 다음 args 가 value 라고 가정하고 value 를 가져옴
    // value 에 scope 가 있는 경우 scope 끝까지 가져옴
    readNextValues(value: string): string
    {
        let scopeStatus = new ScopeStatus();

        if (value)
        {
            checkScope(value, scopeStatus);
            if (scopeStatus.isEnded)
                return value;
        }
        else
            value = "";

        while (true)
        {
            let v = this.getNextArg();
            console.log(v);
            if (!v)
                break;
            
            if (value)
                value += " ";
            value += v;

            checkScope(v, scopeStatus);
            if (scopeStatus.isEnded)
                break;
        }

        return value;
    }

    parseArg(arg: string): ArgumentKeyValue
    {
        if (arg.startsWith('-')) // -key~~
        {
            let kv = arg.split('=');

            if (kv.length == 1) // -key
            {
                let nextArg: string = this.peekNextArg();
                
                if (!nextArg) // last key
                {
                    return {
                        key: kv[0],
                        value: null
                    };
                }
                else if (nextArg.startsWith('-')) // -key1 -key2
                {
                    return {
                        key: kv[0],
                        value: null
                    };
                }
                else // -key value
                {
                    return {
                        key: kv[0],
                        value: this.readNextValues(null)
                    };
                }
            }
            else // -key=value
            {
                let v = kv.slice(1).join(' ');
                return {
                    key: kv[0],
                    value: this.readNextValues(v)
                };
            }
        }
        else // value
        {
            return {
                key: null,
                value: this.readNextValues(arg)
            };
        }
    }

    parse(): Array<ArgumentKeyValue>
    {
        this.argIndex = 0;
        const argkvList: Array<ArgumentKeyValue> = [];

        let arg: string;
        while (arg = this.getNextArg())
        {
            let argkv: ArgumentKeyValue = this.parseArg(arg);

            if (argkv)
                argkvList.push(argkv);
        }

        return argkvList;
    }
}

export class _ArgumentParser
{
    parseString(argStr: string): Array<ArgumentKeyValue>
    {
        const args = argStr.split(" ");
        let argkvList: Array<ArgumentKeyValue> = [];

        let type: "key"|"value" = "key";
        let argEnd: boolean = true;
        let valueEnd: boolean = true;

        let key: string = "";
        let value: string = "";

        let scopeStatus = new ScopeStatus();

        args.forEach((argStr) =>
        {
            if (valueEnd && argStr.startsWith("-")) // -key
            {
                let kvSpl: Array<string> = argStr.split("=");
                if (kvSpl.length == 1) // only key
                {
                    key += argStr;
                    value = "";
                    type = "value";
                    argEnd = false;
                }
                else if (kvSpl.length == 2) // key=value
                {
                    key = kvSpl[0];
                    value = kvSpl[1];
                    type = "value";
                    checkScope(value, scopeStatus);
                    argEnd = scopeStatus.isEnded;
                }
            }
            else // value
            {
                if (type == "key")
                {
                    key = argStr;
                    value = null;
                    type = "key";
                    argEnd = true;
                }
                else if (type == "value")
                {
                    value += argStr;
                    checkScope(argStr, scopeStatus);
                    argEnd = scopeStatus.isEnded;
                }
            }

            if (argEnd)
            {
                argkvList.push({ key, value })
                key = "";
                value = "";
                type = "key";
                scopeStatus = new ScopeStatus();
            }
        });

        return argkvList;
    }

    parseString2(argStr: string): Array<ArgumentKeyValue>
    {
        let argkvList: Array<ArgumentKeyValue> = [];

        let c: string;
        let key = "";
        let value = "";

        let currType: "key"|"value"|"none" = "none";
        let argEnd: boolean = false;
        let singleQuotes = 0;
        let doubleQuotes = 0;

        for (let i = 0; i < argStr.length; i++)
        {
            c = argStr[i];

            switch (c)
            {
                case "-":
                    if (currType == "none")
                    {
                        currType = "key";
                        key += '-';
                    }
                    else if (currType == "key")
                        key += '-'
                    else if (currType == "value")
                        value += '-'
                    break;

                case "=":
                    if (currType == "key")
                        currType = "value";
                    break;

                case " ":
                    if (currType == "key")
                        currType = "value";
                    else if (currType == "value")
                        currType = "key";
                    break;

                case "\"":
                    //if (currType == "key")
                    //    throw new ParseError(i);

                    break;

                case "'":
                    //if (currType == "key")
                    //    throw new ParseError(i);
                    break;

                default:
                    if (currType == "key")
                        key += c;
                    else if (currType == "value")
                        value += c;
                    break;
            }

            if (argEnd)
            {
                argkvList.push({key, value});

                argEnd = false;
                key = "";
                value = "";
            }

        }

        return argkvList;
    }
}