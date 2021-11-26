import { ASTDataKind, ASTNode, treeify } from './main.ts';

function buildHTML(root: ASTNode) {
    let out = '';
    let buildAttrs = (attrs: ASTNode) => {
        let out = '';
        if(attrs.kind !== ASTDataKind.LIST) {
            return attrs.data ? attrs.data.toString() : '';
        }
        attrs.children.forEach((c, i, a) => {
            if(c.kind !== ASTDataKind.LIST) {
                out += c.data ? c.data.toString() : '';
            }
            else {
                out += c.children[0].data ? c.children[0].data.toString() : '';
                if(c.children.length > 1) {
                    out += '="' + c.children.slice(1).map(c => c.data).join(' ') + '"';
                }
            }
            if(i !== a.length - 1) out += ' ';
        });
        return out;
    };
    switch(root.kind) {
    case ASTDataKind.LIST:
        out += '<' + buildHTML(root.children[0]);
        let attrString = buildAttrs(root.children[1]);
        if(attrString.length > 0) {
            out += ' ' + attrString;
        }
        out += '>';
        out += root.children.slice(2).map(buildHTML).join(' ');
        out += '</' + buildHTML(root.children[0]) + '>';
        break;
    default:
        out += root.data;
    }
    return out;
}

let sampleHTML = `
(html ()
    (head ()
        (title () "Hello world!"))
    (body ()
        (h1 () "Hello world!" "How are you today?")
        (div ((class "class-1 class-2 class-3")) "This is my first LispHTML page!")))
`;
console.log(sampleHTML);
console.log(treeify(sampleHTML).map(buildHTML).join(''));
