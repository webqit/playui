
/**
 * @imports
 */
import Fs from 'fs';
import Path from 'path';
import Showdown from 'showdown';
import Jsdom from 'jsdom';
import ShowdownHighlight from 'showdown-highlight';
import { _beforeLast } from '@webqit/util/str/index.js';
import { _last } from '@webqit/util/arr/index.js';
import { _merge } from '@webqit/util/obj/index.js';

export default function(resource, params, args, recieved, meta, next) {
    // Catch .md files
    if (recieved || !resource.endsWith('.md')) {
        // Or let the flow continue
        return next(recieved);
    }
    // --------------
    var fixLinksToReadme = () => ({
        type: 'lang', 
        regex: /\[(.*)\]\((.*)?\/readme\.md(.*)?\)/ig, 
        replace: '[$1]($2$3)',
    });
    var fixRelativeUrls = () => ({
        type: 'lang', 
        filter: text => {
            return text.replace(/(?<=\])\(([^\)]*)?\)/g, (match, matchGroup1) => {
                if (!matchGroup1.match(/^(\/|#|http:|https:|file:|ftp:)/)) {
                    return `(${Path.join(args.base_url || '', Path.dirname(resource), matchGroup1)})`;
                }
                return match;
            });
        },
    });
    // --------------
    var showdownParams = {metadata: true, tables: true, extensions: [ fixLinksToReadme, fixRelativeUrls ]};
    if (args.code_highlighting) {
        showdownParams.extensions.push(ShowdownHighlight);
    }
    var markdown = new Showdown.Converter(showdownParams);
    if (args.flavor) {
        markdown.setFlavor(args.flavor);
    }

    var html = markdown.makeHtml(Fs.readFileSync(resource).toString());
    var metadata = markdown.getMetadata();
    _merge(meta, metadata);
    var exportGroup = _beforeLast(Path.basename(resource), '.').toLowerCase();
    var t = "\t".repeat(params.indentation + 2), t2 = "\t".repeat(params.indentation + 1);
    var content = `\r\n\r\n` + t + html + `\r\n\r\n` + t2;
    if (params.EXPORT_GROUP_ATTR) {
        content = `<div ${params.EXPORT_GROUP_ATTR}="${exportGroup}">${content}</div>`;
    } else {
        content = `<div>${content}</div>`;
    }

    if ((args.outline_generation || '').trim()) {
        var outline = [],
            jsdomInstance = new Jsdom.JSDOM(content),
            contentElement = jsdomInstance.window.document.body.firstElementChild,
            lastItem;
        contentElement.childNodes.forEach(node => {
            var textContent = (node.textContent || '').trim();
            if (node.nodeType === 1/** ELEMENT_NODE */ && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName)) {
                var level = parseInt(node.nodeName.substr(1)), 
                    item = {level, title: textContent, uri: node.id, subtree: []};
                if (level === 1 || !outline.length) {
                    outline.push(item);
                } else if (level > lastItem.level) {
                    lastItem.subtree.push(item);
                    Object.defineProperty(item, 'parent', {value: lastItem, enumerable: false});
                } else {
                    var _parent = lastItem;
                    while(_parent && level <= _parent.level) {
                        _parent = _parent.parent;
                    }
                    if (!_parent) {
                        _parent = _last(outline);
                    }
                    _parent.subtree.push(item);
                    Object.defineProperty(item, 'parent', {value: _parent, enumerable: false});
                }
                lastItem = item;
            }
        });
        meta.outline = outline;
    }

    return content;    
};