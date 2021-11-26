import { ASTDataKind, ASTNode, treeify, fail } from './main.ts';

const binOps = new Map<string, string>();
binOps.set('eq?', '===');
binOps.set('<=', '<=');
binOps.set('>=', '>=');
binOps.set('+', '+');
binOps.set('-', '-');
binOps.set('*', '*');
binOps.set('/', '/');

function buildJS(root: ASTNode): string {
    if(root.kind === ASTDataKind.LIST) {
        if(root.children.length === 0) return 'null';
        let firstChild = root.children[0];
        if(firstChild.kind === ASTDataKind.VALUE) {
            if(firstChild.data! === 'define') {
                if(root.children.length !== 3) {
                    fail('buildJS', `Expected two clauses for define, got ${root.children.length - 1}`);
                }
                if(root.children[1].kind !== ASTDataKind.VALUE) {
                    fail('buildJS', `Cannot assign non-identifier to value`);
                }
                return `const ${root.children[1].data!} = ${buildJS(root.children[2])};`;
            }
            if(firstChild.data! === 'if') {
                if(root.children.length !== 4) {
                    fail('buildJS', `Expected three clauses for define, got ${root.children.length - 1}`);
                }
                return `(${buildJS(root.children[1])}) ? (${buildJS(root.children[2])}) : (${buildJS(root.children[3])})`;
            }
            if(firstChild.data! === 'lambda') {
                if(root.children.length !== 3) {
                    fail('buildJS', `Expected two clauses for lambda, got ${root.children.length - 1}`);
                }
                if(root.children[1].kind !== ASTDataKind.LIST) {
                    fail('buildJS', `Expected identifier list for lambda`);
                }
                if(root.children[1].children.filter(c => c.kind !== ASTDataKind.VALUE).length > 0) {
                    fail('buildJS', `Identifier list must only contain identifiers`);
                }
                return `(${root.children[1].children.map(c => c.data!.toString()).join(',')}) => ${buildJS(root.children[2])}`;
            }
            if(binOps.has(firstChild.data!.toString())) {
                const op = firstChild.data!.toString();
                return root.children.slice(1).map(buildJS).join(binOps.get(op));
            }
            return `${firstChild.data!}(${root.children.slice(1).map(buildJS).join(',')})`;
        }
        if(firstChild.kind !== ASTDataKind.LIST) {
            return `${firstChild.data!}(${root.children.slice(1).map(v => v.data!).join(', ')})`;
        }
    }
    else {
        return root.data!.toString();
    }
    return '';
}

function buildExprs(root: ASTNode): string {
    const out = buildJS(root);
    // TODO: improve?
    if(out.indexOf('const') === 0) {
        return out;
    }
    return `console.log(${out})`;
}

let sampleJS = `
(define x 5)
(if (<= x 5) x y)
(define f (lambda (x) (<= x 5)))
(if (f 10) y x)
`
if(Deno.args.length < 1) {
    fail('usage', `js.ts filename.rkt`);
}
let filename = Deno.args[0];
let contents = await Deno.readTextFile(filename);
// remove #lang racket
contents = contents.split('\n').slice(1).join('\n');

console.log(treeify(contents).map(buildExprs).join('\n'));
