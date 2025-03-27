export type Node =
	| DocumentNode
	| ElementNode
	| TextNode
	| CommentNode
	| DoctypeNode;
export type NodeType =
	| typeof DOCUMENT_NODE
	| typeof ELEMENT_NODE
	| typeof TEXT_NODE
	| typeof COMMENT_NODE
	| typeof DOCTYPE_NODE;
export interface Location {
	start: number;
	end: number;
}
interface BaseNode {
	type: NodeType;
	loc: [Location, Location];
	parent: Node;
	[key: string]: any;
}

interface LiteralNode extends BaseNode {
	value: string;
}

interface ParentNode extends BaseNode {
	children: Node[];
}

export interface DocumentNode extends Omit<ParentNode, 'parent'> {
	type: typeof DOCUMENT_NODE;
	attributes: Record<string, string>;
	parent: undefined;
}

export interface ElementNode extends ParentNode {
	type: typeof ELEMENT_NODE;
	name: string;
	attributes: Record<string, string>;
}

export interface TextNode extends LiteralNode {
	type: typeof TEXT_NODE;
}

export interface CommentNode extends LiteralNode {
	type: typeof COMMENT_NODE;
}

export interface DoctypeNode extends LiteralNode {
	type: typeof DOCTYPE_NODE;
}

export const DOCUMENT_NODE = 0;
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 2;
export const COMMENT_NODE = 3;
export const DOCTYPE_NODE = 4;

export function h(
	type: any,
	props: null | Record<string, any> = {},
	...children: any[]
) {
	const vnode: ElementNode = {
		type: ELEMENT_NODE,
		name: typeof type === 'function' ? type.name : type,
		attributes: props || {},
		children: children.map((child) =>
			typeof child === 'string'
				? { type: TEXT_NODE, value: escapeHTML(String(child)) }
				: child,
		),
		parent: undefined as any,
		loc: [] as any,
	};
	if (typeof type === 'function') {
		__unsafeRenderFn(vnode, type);
	}
	return vnode;
}
export const Fragment = Symbol('Fragment');

const VOID_TAGS = new Set<string>([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
]);
const RAW_TAGS = new Set<string>(['script', 'style']);
const DOM_PARSER_RE =
	/(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!)([\s\S]*?)(>))/gm;

const ATTR_KEY_IDENTIFIER = /[\@\.a-z0-9_\:\-]/i;

function splitAttrs(str?: string) {
	let obj: Record<string, string> = {};
	if (str) {
		let state: 'none' | 'key' | 'value' = 'none';
		let currentKey: string | undefined;
		let currentValue: string = '';
		let tokenStartIndex: number | undefined;
		let valueDelimiter: '"' | "'" | undefined;
		for (let currentIndex = 0; currentIndex < str.length; currentIndex++) {
			const currentChar = str[currentIndex];

			if (state === 'none') {
				if (ATTR_KEY_IDENTIFIER.test(currentChar)) {
					// add attribute
					if (currentKey) {
						obj[currentKey] = currentValue;
						currentKey = undefined;
						currentValue = '';
					}

					tokenStartIndex = currentIndex;
					state = 'key';
				} else if (currentChar === '=' && currentKey) {
					state = 'value';
				}
			} else if (state === 'key') {
				if (!ATTR_KEY_IDENTIFIER.test(currentChar)) {
					currentKey = str.substring(tokenStartIndex!, currentIndex);
					if (currentChar === '=') {
						state = 'value';
					} else {
						state = 'none';
					}
				}
			} else {
				if (
					currentChar === valueDelimiter &&
					currentIndex > 0 &&
					str[currentIndex - 1] !== '\\'
				) {
					if (valueDelimiter) {
						currentValue = str.substring(tokenStartIndex!, currentIndex);
						valueDelimiter = undefined;
						state = 'none';
					}
				} else if (
					(currentChar === '"' || currentChar === "'") &&
					!valueDelimiter
				) {
					tokenStartIndex = currentIndex + 1;
					valueDelimiter = currentChar;
				}
			}
		}
		if (
			state === 'key' &&
			tokenStartIndex != undefined &&
			tokenStartIndex < str.length
		) {
			currentKey = str.substring(tokenStartIndex, str.length);
		}
		if (currentKey) {
			obj[currentKey] = currentValue;
		}
	}
	return obj;
}

export function parse(input: string | ReturnType<typeof html>): any {
	let str = typeof input === 'string' ? input : input.value;
	let doc: Node,
		parent: Node,
		token: any,
		text,
		i,
		bStart,
		bText,
		bEnd,
		tag: Node;
	const tags: Node[] = [];
	DOM_PARSER_RE.lastIndex = 0;
	parent = doc = {
		type: DOCUMENT_NODE,
		children: [] as Node[],
	} as any;

	let lastIndex = 0;
	function commitTextNode() {
		text = str.substring(lastIndex, DOM_PARSER_RE.lastIndex - token[0].length);
		if (text) {
			(parent as ParentNode).children.push({
				type: TEXT_NODE,
				value: text,
				parent,
			} as any);
		}
	}

	while ((token = DOM_PARSER_RE.exec(str))) {
		bStart = token[5] || token[8];
		bText = token[6] || token[9];
		bEnd = token[7] || token[10];
		if (RAW_TAGS.has(parent.name) && token[2] !== parent.name) {
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			if (parent.children.length > 0) {
				parent.children[0].value += token[0];
			}
			continue;
		} else if (bStart === '<!--') {
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			if (RAW_TAGS.has(parent.name)) {
				continue;
			}
			tag = {
				type: COMMENT_NODE,
				value: bText,
				parent: parent,
				loc: [
					{
						start: i,
						end: i + bStart.length,
					},
					{
						start: DOM_PARSER_RE.lastIndex - bEnd.length,
						end: DOM_PARSER_RE.lastIndex,
					},
				],
			} as any;
			tags.push(tag);
			(tag.parent as any).children.push(tag);
		} else if (bStart === '<!') {
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			tag = {
				type: DOCTYPE_NODE,
				value: bText,
				parent: parent,
				loc: [
					{
						start: i,
						end: i + bStart.length,
					},
					{
						start: DOM_PARSER_RE.lastIndex - bEnd.length,
						end: DOM_PARSER_RE.lastIndex,
					},
				],
			};
			// commitTextNode();
			tags.push(tag);
			tag.parent.children.push(tag);
		} else if (token[1] !== '/') {
			commitTextNode();
			if (RAW_TAGS.has(parent.name)) {
				lastIndex = DOM_PARSER_RE.lastIndex;
				commitTextNode();
				continue;
			} else {
				tag = {
					type: ELEMENT_NODE,
					name: token[2] + '',
					attributes: splitAttrs(token[3]),
					parent,
					children: [],
					loc: [
						{
							start: DOM_PARSER_RE.lastIndex - token[0].length,
							end: DOM_PARSER_RE.lastIndex,
						},
					] as any,
				};
				tags.push(tag);
				tag.parent.children.push(tag);
				if (
					(token[4] && token[4].indexOf('/') > -1) ||
					VOID_TAGS.has(tag.name)
				) {
					tag.loc[1] = tag.loc[0];
					tag.isSelfClosingTag = true;
				} else {
					parent = tag;
				}
			}
		} else {
			commitTextNode();
			// Close parent node if end-tag matches
			if (token[2] + '' === parent.name) {
				tag = parent;
				parent = tag.parent!;
				tag.loc.push({
					start: DOM_PARSER_RE.lastIndex - token[0].length,
					end: DOM_PARSER_RE.lastIndex,
				});
				text = str.substring(tag.loc[0].end, tag.loc[1].start);
				if (tag.children.length === 0) {
					tag.children.push({
						type: TEXT_NODE,
						value: text,
						parent,
					});
				}
			}
			// account for abuse of self-closing tags when an end-tag is also provided:
			else if (
				token[2] + '' === tags[tags.length - 1].name &&
				tags[tags.length - 1].isSelfClosingTag === true
			) {
				tag = tags[tags.length - 1];
				tag.loc.push({
					start: DOM_PARSER_RE.lastIndex - token[0].length,
					end: DOM_PARSER_RE.lastIndex,
				});
			}
		}
		lastIndex = DOM_PARSER_RE.lastIndex;
	}
	text = str.slice(lastIndex);
	parent.children.push({
		type: TEXT_NODE,
		value: text,
		parent,
	});
	return doc;
}

export interface Visitor {
	(node: Node, parent?: Node, index?: number): void | Promise<void>;
}

export interface VisitorSync {
	(node: Node, parent?: Node, index?: number): void;
}

class Walker {
	constructor(private callback: Visitor) {}
	async visit(node: Node, parent?: Node, index?: number): Promise<void> {
		await this.callback(node, parent, index);
		if (Array.isArray(node.children)) {
			let promises: Promise<void>[] = [];
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				promises.push(this.visit(child, node, i));
			}
			await Promise.all(promises);
		}
	}
}

class WalkerSync {
	constructor(private callback: VisitorSync) {}
	visit(node: Node, parent?: Node, index?: number): void {
		this.callback(node, parent, index);
		if (Array.isArray(node.children)) {
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				this.visit(child, node, i);
			}
		}
	}
}

const HTMLString = Symbol('HTMLString');
const AttrString = Symbol('AttrString');
export const RenderFn = Symbol('RenderFn');
function mark(str: string, tags: symbol[] = [HTMLString]): { value: string } {
	const v = { value: str };
	for (const tag of tags) {
		Object.defineProperty(v, tag, {
			value: true,
			enumerable: false,
			writable: false,
		});
	}
	return v;
}

export function __unsafeHTML(str: string) {
	return mark(str);
}
export function __unsafeRenderFn(
	node: ElementNode,
	fn: (props: Record<string, any>, ...children: Node[]) => Node,
) {
	Object.defineProperty(node, RenderFn, {
		value: fn,
		enumerable: false,
	});
	return node;
}

const ESCAPE_CHARS: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
};
function escapeHTML(str: string): string {
	return str.replace(/[&<>]/g, (c) => ESCAPE_CHARS[c] || c);
}
export function attrs(attributes: Record<string, string>) {
	let attrStr = '';
	for (const [key, value] of Object.entries(attributes)) {
		attrStr += ` ${key}="${value}"`;
	}
	return mark(attrStr, [HTMLString, AttrString]);
}
export function html(tmpl: TemplateStringsArray, ...vals: any[]) {
	let buf = '';
	for (let i = 0; i < tmpl.length; i++) {
		buf += tmpl[i];
		const expr = vals[i];
		if (buf.endsWith('...') && expr && typeof expr === 'object') {
			buf = buf.slice(0, -3).trimEnd();
			buf += attrs(expr).value;
		} else if (expr && expr[AttrString]) {
			buf = buf.trimEnd();
			buf += expr.value;
		} else if (expr && expr[HTMLString]) {
			buf += expr.value;
		} else if (typeof expr === 'string') {
			buf += escapeHTML(expr);
		} else if (expr || expr === 0) {
			buf += String(expr);
		}
	}
	return mark(buf);
}

export function walk(node: Node, callback: Visitor): Promise<void> {
	const walker = new Walker(callback);
	return walker.visit(node);
}

export function walkSync(node: Node, callback: VisitorSync): void {
	const walker = new WalkerSync(callback);
	return walker.visit(node);
}

function canSelfClose(node: Node): boolean {
	if (node.children.length === 0) {
		let n: Node | undefined = node;
		while ((n = n.parent)) {
			if (n.name === 'svg') return true;
		}
	}
	return false;
}

async function renderElement(node: Node): Promise<string> {
	const { name, attributes = {} } = node;
	const children = await Promise.all(
		node.children.map((child: Node) => render(child)),
	).then((res) => res.join(''));
	if (RenderFn in node) {
		const value = await (node as any)[RenderFn](attributes, mark(children));
		if (value && (value as any)[HTMLString]) return value.value;
		return escapeHTML(String(value));
	}
	if (name === Fragment) return children;
	const isSelfClosing = canSelfClose(node);
	if (isSelfClosing || VOID_TAGS.has(name)) {
		return `<${node.name}${attrs(attributes).value}${
			isSelfClosing ? ' /' : ''
		}>`;
	}
	return `<${node.name}${attrs(attributes).value}>${children}</${node.name}>`;
}

function renderElementSync(node: Node): string {
	const { name, attributes = {} } = node;
	const children = node.children
		.map((child: Node) => renderSync(child))
		.join('');
	if (RenderFn in node) {
		const value = (node as any)[RenderFn](attributes, mark(children));
		if (value && (value as any)[HTMLString]) return value.value;
		return escapeHTML(String(value));
	}
	if (name === Fragment) return children;
	const isSelfClosing = canSelfClose(node);
	if (isSelfClosing || VOID_TAGS.has(name)) {
		return `<${node.name}${attrs(attributes).value}${
			isSelfClosing ? ' /' : ''
		}>`;
	}
	return `<${node.name}${attrs(attributes).value}>${children}</${node.name}>`;
}

export function renderSync(node: Node): string {
	switch (node.type) {
		case DOCUMENT_NODE:
			return node.children.map((child: Node) => renderSync(child)).join('');
		case ELEMENT_NODE:
			return renderElementSync(node);
		case TEXT_NODE:
			return `${node.value}`;
		case COMMENT_NODE:
			return `<!--${node.value}-->`;
		case DOCTYPE_NODE:
			return `<!${node.value}>`;
	}
}

export async function render(node: Node): Promise<string> {
	switch (node.type) {
		case DOCUMENT_NODE:
			return Promise.all(
				node.children.map((child: Node) => render(child)),
			).then((res) => res.join(''));
		case ELEMENT_NODE:
			return renderElement(node);
		case TEXT_NODE:
			return `${node.value}`;
		case COMMENT_NODE:
			return `<!--${node.value}-->`;
		case DOCTYPE_NODE:
			return `<!${node.value}>`;
	}
}

export interface Transformer {
	(node: Node): Node | Promise<Node>;
}

export async function transform(
	markup: string | Node,
	transformers: Transformer[] = [],
): Promise<string> {
	if (!Array.isArray(transformers)) {
		throw new Error(
			`Invalid second argument for \`transform\`! Expected \`Transformer[]\` but got \`${typeof transformers}\``,
		);
	}
	const doc = typeof markup === 'string' ? parse(markup) : markup;
	let newDoc = doc;
	for (const t of transformers) {
		newDoc = await t(newDoc);
	}
	return render(newDoc);
}
