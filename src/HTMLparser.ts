import type { RootSegment, Segment, TagSegment, TextSegment } from "./types";
import { antiRecursiveReferenceGenerator } from "./antiRecursiveReferenceGenerator";
import { RegularExpressions } from "./regularExpressions";
import { extractAttributes } from "./extractors";
import { Settings, defaultSettings } from "./settings";
import diff from 'diff';

let currentSettings: Settings = defaultSettings;

export const setSettings = (settings: Partial<Settings>) => {
    currentSettings = { ...currentSettings, ...settings };
}

const HTMLToSegments = (html: string): RootSegment => {
    const root: Segment = {
        type: 'root',
        children: [],
        path: '',
        isNormalized: true,
    };
    let currentPath: string = '';
    let lastSegment: RootSegment|TagSegment = root;
    
    html.split(RegularExpressions.Tag).forEach((segment, idx) => {
        // tag node
        const tagName = segment.match(RegularExpressions.TagName);
        if(tagName){
            if(idx % 2 === 0)
                root.isNormalized = false;
            if(segment.match(RegularExpressions.SelfClosingTag)){
                lastSegment.children.push({
                    name: tagName[1],
                    type: 'tag',
                    parent: lastSegment,
                    children: [],
                    attributes: extractAttributes(segment),
                    path: `${currentPath}[${lastSegment.children.length}]'${tagName[1]}'`,
                } as TagSegment);
            }
            else if(segment.match(RegularExpressions.ClosingTag)) {
                    if(lastSegment.type === 'root'){
                        throw new Error('How did you end the root??');
                    }
                    lastSegment = lastSegment.parent;
                    currentPath = lastSegment.path;
            }
            else{
                lastSegment.children.push({
                    name: tagName[1],
                    type: 'tag',
                    parent: lastSegment,
                    children: [],
                    attributes: extractAttributes(segment),
                    path: `${currentPath}[${lastSegment.children.length}]'${tagName[1]}'`,
                } as TagSegment);
                currentPath = `${currentPath}[${lastSegment.children.length}]'${tagName[1]}'`;
                lastSegment = lastSegment.children[lastSegment.children.length - 1] as TagSegment;
            }
        }
        // text node
        else{
            if(idx % 2 !== 0)
                root.isNormalized = false;
            lastSegment.children.push({ type: 'text', text: segment, children: [], path: `${currentPath}[${lastSegment.children.length}]` } as TextSegment);
        }
    });
    if(currentPath !== '')
        throw new Error('The root was not closed');
    return root;
}

const segmentsToHTML = (root: RootSegment | TagSegment) => {
    htmlNormalize(root);
    let html = '';
    root.children.forEach(segment => {
        if(segment.type === 'text'){
            html += segment.children.join('');
        }
        else{
            html += `<${segment.name}${Object.entries(segment.attributes).length?' ':''}${Object.entries(segment.attributes).filter(([key])=>key).map(([key, value])=>(value?`${key}="${value}"`:key)).join(' ')} ${segment.children.length === 0 ? currentSettings.input.voidElements.includes(segment.name) ? currentSettings.output.xmlMode : '/' :'' }>${segmentsToHTML(segment as TagSegment)}${segment.children.length !== 0 || !currentSettings.input.voidElements.includes(segment.name)?`</${segment.name}>`:""}`;
        }
    });
    return html;
}

const cloneSegment = <T extends Segment & (RootSegment | TextSegment | TagSegment)>(segment: T): T => {
    if(segment.type === 'text'){
        return { type: 'text', text: segment.text, children: [], path: segment.path } as T;
    }
    else if (segment.type === 'tag'){
        return { type: 'tag', name: segment.name, parent: segment.parent, children: segment.children.map(k=>cloneSegment<typeof k>(k)), attributes: {...segment.attributes}, path: segment.path } as T;
    }
    else{
        return { type: 'root', children: segment.children.map(cloneSegment), path: segment.path??'', isNormalized: segment.isNormalized } as T;
    }

}

const removeEmptyTextNodesFromSegment = (root: RootSegment | TagSegment, check: (segment: Segment)=>boolean = antiRecursiveReferenceGenerator()): void => {
    if(check(root))
        return;
    for(let i = 0; i<root.children.length;){
        const segment = root.children[i];
        if(!segment){
            //remove falsy children - they shouldn't have gotten here anyway.
            root.children.splice(i, 1);
            continue;
        }
        switch(segment.type){
            case 'text':
                if(segment.text === ''){
                    root.children.splice(i, 1);
                    continue;
                }
                i++;
                break;
            case 'tag':
                removeEmptyTextNodesFromSegment(segment);
                i++;
                break;
            default:
                if((segment as RootSegment).type === 'root'){
                    throw new Error('Roots should not be in the children of a root or tag');
                }
                else{
                    throw new Error('Unknown segment type');
                }
        }
    }
}

const htmlNormalize = (root: RootSegment | TagSegment): void => {
    internalNormalize(root);
    removeEmptyTextNodesFromSegment(root);
}

const internalNormalize = (root: RootSegment | TagSegment, check: (segment: Segment)=>boolean = antiRecursiveReferenceGenerator()): void => {
    if(check(root))
    return;
    if(root.type === 'tag'){
        let i = 0;
        let currentNode = root.children[i];
        while(i<root.children.length){
            //remove falsy children - they shouldn't have gotten here anyway.
            if(!currentNode){
                root.children.splice(i, 1);
                currentNode = root.children[i];
                continue;
            }
            if(i%2 === 0){
                //should be a text node.
                if(currentNode.type !== 'text'){
                    root.children.splice(i, 0, { type: 'text', text: '', children: [], path: `${root.path}[${i}]` } as TextSegment);
                    currentNode = root.children[i];
                    continue;
                }
            }
            else{
                //should be a tag node.
                if(currentNode.type == 'text'){
                    const previousTextNode = root.children[i-1] as TextSegment;
                    previousTextNode.text += currentNode.text??'';
                    root.children.splice(i, 0);
                    currentNode = root.children[i];
                    continue;
                }
                else{
                    internalNormalize(currentNode, check);
                }
            }
        }
    }
}

const mutateSegmentsByTextNode = (root: RootSegment | TagSegment, callback: (string: string, segment: Segment)=>string, check: (segment: Segment)=>boolean = antiRecursiveReferenceGenerator()): RootSegment | TagSegment => {
    root.children = root.children.map(segment => {
        if(check(segment))
            return segment;
        if(segment.type === 'text'){
            segment.text = callback(segment.text, segment);
            return segment;
        }
        const isUntouchable = currentSettings.input.elementsToIgnoreContentFor.includes(segment.name);
        if(isUntouchable){
            return segment;
        }
        return mutateSegmentsByTextNode(segment, callback) as TagSegment;
    });
    return root;
}

type SegmentCollection = TextSegment[][] & [TextSegment[]];

const createBlockRepresentation = (root: RootSegment | TagSegment, check: (segment: Segment)=>boolean = antiRecursiveReferenceGenerator(), ignore: boolean = false): SegmentCollection => {
    const blocks: SegmentCollection = [[]];
    
    if(root.children.length === 0){
        throw new Error('Root has no children; expected at least 1 text segment');
    }
    for(let i = 0; i<root.children.length; i++){
        const segment = root.children[i] as TagSegment | TextSegment;
        if(check(segment))
            continue;
        if(i%2 === 0 && segment.type !== 'text'){
            throw new Error('Root has a non-text segment at an odd index');
        }
        if(i%2 !== 0 && segment.type !== 'tag'){
            throw new Error('Root has a non-tag segment at an even index');
        }
        if(segment.type === 'text' && !ignore){
            blocks.at(-1)?.push(segment);
            continue;
        }
        else if (segment.type === 'text' && ignore){
            continue;
        }
        else{
            const tagSegment = segment as TagSegment;
            if(currentSettings.input.elementsToIgnoreContentFor.includes(tagSegment.name)){
                const result = createBlockRepresentation(tagSegment, check, true);
                const first = result.shift() as TextSegment[];
                blocks.at(-1)?.push(...first);
                blocks.push(...result);
            }
            if(currentSettings.input.inlineElements.includes(tagSegment.name)){
                const result = createBlockRepresentation(tagSegment, check, ignore);
                const first = result.shift() as TextSegment[];
                blocks.at(-1)?.push(...first);
                blocks.push(...result);
            }
            else{
                const result = createBlockRepresentation(tagSegment, check, ignore);
                blocks.push(...result);
            }
        }  
    }
    return blocks;
}
/*
function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
*/
const mutateSegmentsByTextBlock = (root: RootSegment | TagSegment, callback: (text: string)=>string, check: (segment: Segment)=>boolean = antiRecursiveReferenceGenerator()): RootSegment | TagSegment => {
    
    const blocks = createBlockRepresentation(root, check).map(k=>{
        let start = 0;
        const containers = k.map(segment=>{    
        let ret = ({
            segment,
            start,
            end: start + segment.text.length,
        });
        start += segment.text.length;
        return ret;
    })
        const oldString = k.reduce((str, segment)=>str+segment.text,'');
        return { containers, oldString, newString:''  };
});
    blocks.forEach(block=>{
        block.newString = callback(block.oldString);

        const diffs = diff.diffChars(block.oldString, block.newString)
        let currentString = '';
        let currentIndex = 0;
        let currentContainer = 0;
        for(let i = 0; i<diffs.length; i++){
            currentString += diffs[i]?.value as string;
            if(!diffs[i]?.removed){
                currentIndex += diffs[i]?.value.length as number;
            }
            if(currentIndex >= (block.containers?.[currentContainer]?.end as number) &&  currentContainer !== block.containers.length - 1){
                const conta = block.containers[currentContainer];
                if(conta){
                conta.segment.text = currentString;
                currentString = '';
                currentContainer++;
                }
            }
            else if(block.containers.length - 1){
                const conta = block.containers[currentContainer];
                if(conta){
                conta.segment.text = currentString;
            }
        }
    }
    });
    return root;
}

export const ReplaceInHTML = (html: string, search: RegExp| string, replaceWith: string|((match: string, ...args: any[])=>string)): string => { 
    const segments = HTMLToSegments(html);
    const newSegments = mutateSegmentsByTextBlock(segments, (text)=>text.replace(search, typeof replaceWith === 'string' ? (()=>replaceWith): replaceWith));
    return segmentsToHTML(newSegments);
}
