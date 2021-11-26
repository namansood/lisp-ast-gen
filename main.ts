const sampleInput = `(define x (a b c (-123 "456 789" 10.5 11)))`;

enum TokenKind {
    LEFT_BRACKET,
    RIGHT_BRACKET,
    STRING,
    NUMBER,
    IDENTIFIER
};

class Token {
    kind: TokenKind;
    value: string;

    constructor(kind: TokenKind, value: string) {
        this.kind = kind;
        this.value = value;
    }
};

function fail(fn: string, msg: string): never {
    throw `${fn}: ${msg}`;
}

function isDigit(c: string) {
    return c.length === 1 && c >= '0' && c <= '9';
}

function isAlphabetic(c: string) {
    return c.length === 1 && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'z'));
}

function isSpace(c: string) {
    return c === ' ' || c === '\t' || c === '\n';
}

function isParen(c: string) {
    return c === '(' || c === ')';
}

function tokenize(inputStr: string) {
    let input = inputStr.split('');
    let tokens: Token[] = [];
    let stack = [];

    let idx = 0;
    while(idx < input.length) {
        switch(input[idx]) {
        case '(':
            stack.push(idx);
            tokens.push(new Token(TokenKind.LEFT_BRACKET, '('));
            break;
        case ')':
            if(stack.length === 0) {
                fail('tokenize', `unexpected ) at position ${idx}`);
            }
            stack.pop();
            tokens.push(new Token(TokenKind.RIGHT_BRACKET, ')'));
            break;
        case '"':
            let startIdx = idx+1, endIdx = idx+1;
            while(++idx < input.length) {
                if(input[idx] === '"') {
                    endIdx = idx;
                    break;
                }
            }
            if(idx >= input.length) {
                fail('tokenize', `expected " to end string starting at position ${startIdx-1}`);
            }
            let str = input.slice(startIdx, endIdx).join('');
            tokens.push(new Token(TokenKind.STRING, str));
            break;
        case ' ':
        case '\t':
        case '\n':
            break;
        default:
            if(isDigit(input[idx]) || input[idx] === '-' || input[idx] === '+') {
                let startIdx = idx, endIdx = idx+1;
                while(++idx < input.length) {
                    let hadDecimalPoint = false;
                    if(!isDigit(input[idx]) && input[idx] !== '.') {
                        endIdx = idx;
                        --idx;
                        break;
                    }
                    else if(input[idx] === '.') {
                        if(!hadDecimalPoint && (isDigit(input[startIdx]) || idx > startIdx + 1)) {
                            hadDecimalPoint = true;
                        }
                        else {
                            fail('tokenize', `unexpected decimal point in number at position ${idx}`);
                        }
                    }
                }
                let value = input.slice(startIdx, endIdx).join('');
                if(value === '+' || value === '-') {
                    tokens.push(new Token(TokenKind.IDENTIFIER, value));
                }
                else {
                    tokens.push(new Token(TokenKind.NUMBER, value));
                }
            }
            else {
                let startIdx = idx, endIdx = idx+1;
                while(++idx < input.length) {
                    if(isSpace(input[idx]) || isParen(input[idx])) {
                        endIdx = idx;
                        --idx;
                        break;
                    }
                }
                let id = input.slice(startIdx, endIdx).join('');
                tokens.push(new Token(TokenKind.IDENTIFIER, id));
            }
            break;
        };
        ++idx;
    }

    if(stack.length) {
        fail('tokenize', `unclosed brackets starting at indices ${stack.join(', ')}`);
    }

    return tokens;
}

enum ASTDataKind {
    NUMBER,
    STRING,
    VALUE,
    LIST
};

class ASTNode {
    kind: ASTDataKind;
    data?: number | string;
    children: ASTNode[];

    constructor(kind: ASTDataKind, children: ASTNode[], data?: number | string) {
        this.kind = kind;
        this.data = data;
        this.children = children;
    }
};

function treeFromTokens(tokens: Token[]) {
    let bracketStack: number[] = [];
    let values: ASTNode[] = [];

    let idx = 0;

    let node: ASTNode;

    while(idx < tokens.length) {
        switch(tokens[idx].kind) {
        case TokenKind.LEFT_BRACKET:
            bracketStack.push(values.length);
            break;
        case TokenKind.RIGHT_BRACKET:
            let startIdx = bracketStack.pop() ?? fail('treeFromTokens', `too many left brackets!`);
            let children = values.splice(startIdx);
            node = new ASTNode(ASTDataKind.LIST, children);
            values.push(node);
            break;
        case TokenKind.IDENTIFIER:
            node = new ASTNode(ASTDataKind.VALUE, [], tokens[idx].value);
            values.push(node);
            break;
        case TokenKind.STRING:
            node = new ASTNode(ASTDataKind.STRING, [], tokens[idx].value);
            values.push(node);
            break;
        case TokenKind.NUMBER:
            let n = Number(tokens[idx].value);
            if(isNaN(n)) {
                fail('treeFromTokens', `got invalid number ${tokens[idx].value}`);
            }
            node = new ASTNode(ASTDataKind.NUMBER, [], n);
            values.push(node);
            break;
        }
        ++idx;
    }
    if(bracketStack.length > 0) {
        fail('treeFromTokens', `unclosed brackets at indices ${bracketStack}`);
    }
    return values;
}

function printTrees(nodes: ASTNode[]) {
    let out = '(';
    nodes.forEach((v, i, a) => {
        out += printTree(v);
        if(i !== a.length - 1) out += ' ';
    });
    out += ')';
    return out;
}

function printTree(node: ASTNode) {
    let out = '';
    switch(node.kind) {
    case ASTDataKind.LIST:
        out += printTrees(node.children);
        break;
    case ASTDataKind.STRING:
        out += '"' + node.data + '"';
        break;
    default:
        out += node.data;
        break;
    };
    return out;
}

function treeify(input: string) {
    try {
        return treeFromTokens(tokenize(input));
    }
    catch(e) {
        fail(`treeify`, e);
    }
}

//console.log(sampleInput);
//console.log(printTrees(treeFromTokens(tokenize(sampleInput))));

export {
    treeify, printTree, printTrees, fail,
    ASTDataKind, ASTNode
};
