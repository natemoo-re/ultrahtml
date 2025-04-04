import type { Node } from './index.js';
import { ELEMENT_NODE, TEXT_NODE, walkSync } from './index.js';
import type { AST, AttributeToken } from 'parsel-js';
import {
	parse,
	specificity as getSpecificity,
	specificityToNumber,
} from 'parsel-js';

export function specificity(selector: string) {
	return specificityToNumber(getSpecificity(selector), 10);
}

export function matches(node: Node, selector: string): boolean {
	const match = selectorToMatch(selector);
	return match(node, node.parent, nthChildIndex(node, node.parent));
}

export function querySelector(node: Node, selector: string): Node {
	const match = selectorToMatch(selector);
	try {
		return select(
			node,
			(n: Node, parent?: Node, index?: number) => {
				let m = match(n, parent, index);
				if (!m) return false;
				return m;
			},
			{ single: true },
		)[0];
	} catch (e) {
		if (e instanceof Error) {
			throw e;
		}
		return e as Node;
	}
}

export function querySelectorAll(node: Node, selector: string): Node[] {
	const match = selectorToMatch(selector);
	return select(node, (n: Node, parent?: Node, index?: number) => {
		let m = match(n, parent, index);
		if (!m) return false;
		return m;
	});
}

export default querySelectorAll;

interface Matcher {
	(n: Node, parent?: Node, index?: number): boolean;
}

function select(
	node: Node,
	match: Matcher,
	opts: { single?: boolean } = { single: false },
): Node[] {
	let nodes: Node[] = [];
	walkSync(node, (n, parent, index): void => {
		if (n && n.type !== ELEMENT_NODE) return;
		if (match(n, parent, index)) {
			if (opts.single) throw n;
			nodes.push(n);
		}
	});
	return nodes;
}

const getAttributeMatch = (selector: AttributeToken) => {
	const { operator = '=' } = selector;
	switch (operator) {
		case '=':
			return (a: string, b: string) => a === b;
		case '~=':
			return (a: string, b: string) => a.split(/\s+/g).includes(b);
		case '|=':
			return (a: string, b: string) => a.startsWith(b + '-');
		case '*=':
			return (a: string, b: string) => a.indexOf(b) > -1;
		case '$=':
			return (a: string, b: string) => a.endsWith(b);
		case '^=':
			return (a: string, b: string) => a.startsWith(b);
	}
	return (a: string, b: string) => false;
};

const nthChildIndex = (node: Node, parent?: Node) =>
	parent?.children
		.filter((n: Node) => n.type === ELEMENT_NODE)
		.findIndex((n: Node) => n === node);
const nthChild = (formula: string) => {
	let [_, A = '1', B = '0'] =
		/^\s*(?:(-?(?:\d+)?)n)?\s*\+?\s*(\d+)?\s*$/gm.exec(formula) ?? [];
	if (A.length === 0) A = '1';
	const a = Number.parseInt(A === '-' ? '-1' : A);
	const b = Number.parseInt(B);
	return (n: number) => a * n + b;
};
const lastChild = (node: Node, parent?: Node) =>
	parent?.children.filter((n: Node) => n.type === ELEMENT_NODE).pop() === node;
const firstChild = (node: Node, parent?: Node) =>
	parent?.children.filter((n: Node) => n.type === ELEMENT_NODE).shift() ===
	node;
const onlyChild = (node: Node, parent?: Node) =>
	parent?.children.filter((n: Node) => n.type === ELEMENT_NODE).length === 1;

const createMatch = (selector: AST): Matcher => {
	switch (selector.type) {
		case 'type':
			return (node: Node) => {
				if (selector.content === '*') return true;
				return node.name === selector.name;
			};
		case 'class':
			return (node: Node) =>
				node.attributes?.class?.split(/\s+/g).includes(selector.name);
		case 'id':
			return (node: Node) => node.attributes?.id === selector.name;
		case 'pseudo-class': {
			switch (selector.name) {
				case 'global':
					return (...args) =>
						selectorToMatch(parse(selector.argument!)!)(...args);
				case 'not':
					return (...args) => !createMatch(selector.subtree!)(...args);
				case 'is':
					return (...args) => selectorToMatch(selector.subtree!)(...args);
				case 'where':
					return (...args) => selectorToMatch(selector.subtree!)(...args);
				case 'root':
					return (node: Node, parent?: Node) =>
						node.type === ELEMENT_NODE && node.name === 'html';
				case 'empty':
					return (node: Node) =>
						node.type === ELEMENT_NODE &&
						(node.children.length === 0 ||
							node.children.every(
								(n: Node) => n.type === TEXT_NODE && n.value.trim() === '',
							));
				case 'first-child':
					return (node: Node, parent?: Node) => firstChild(node, parent);
				case 'last-child':
					return (node: Node, parent?: Node) => lastChild(node, parent);
				case 'only-child':
					return (node: Node, parent?: Node) => onlyChild(node, parent);
				case 'nth-child':
					return (node: Node, parent?: Node) => {
						const target = nthChildIndex(node, parent) + 1;
						if (Number.isNaN(Number(selector.argument))) {
							switch (selector.argument) {
								case 'odd':
									return Math.abs(target % 2) == 1;
								case 'even':
									return target % 2 === 0;
								default: {
									if (!selector.argument) {
										throw new Error(`Unsupported empty nth-child selector!`);
									}
									const nth = nthChild(selector.argument);
									const elements = parent?.children.filter(
										(n: Node) => n.type === ELEMENT_NODE,
									);
									const childIndex = nthChildIndex(node, parent) + 1;
									for (let i = 0; i < elements.length; i++) {
										let n = nth(i);
										if (n > elements.length) return false;
										if (n === childIndex) return true;
									}
									return false;
								}
							}
						}
						return target === Number(selector.argument);
					};
				default:
					throw new Error(`Unhandled pseudo-class: ${selector.name}!`);
			}
		}
		case 'attribute':
			return (node: Node) => {
				let { caseSensitive, name, value } = selector;
				if (!node.attributes) return false;
				const attrs = Object.entries(node.attributes as Record<string, string>);
				for (let [attr, attrVal] of attrs) {
					if (caseSensitive === 'i') {
						value = name.toLowerCase();
						attrVal = attr.toLowerCase();
					}
					if (attr !== name) continue;
					if (!value) return true;
					if (
						(value[0] === '"' || value[0] === "'") &&
						value[0] === value[value.length - 1]
					) {
						value = JSON.parse(value);
					}
					if (value) {
						return getAttributeMatch(selector)(attrVal, value);
					}
				}
				return false;
			};
		case 'universal':
			return (_: Node) => {
				return true;
			};
		default: {
			throw new Error(`Unhandled selector: ${selector.type}`);
		}
	}
};

const selectorToMatch = (sel: string | AST): Matcher => {
	let selector = typeof sel === 'string' ? parse(sel) : sel;
	switch (selector?.type) {
		case 'list': {
			const matchers = selector.list.map((s: any) => createMatch(s));
			return (node: Node, parent?: Node, index?: number) => {
				for (const match of matchers) {
					if (match(node, parent!)) return true;
				}
				return false;
			};
		}
		case 'compound': {
			const matchers = selector.list.map((s: any) => createMatch(s));
			return (node: Node, parent?: Node, index?: number) => {
				for (const match of matchers) {
					if (!match(node, parent!)) return false;
				}
				return true;
			};
		}
		case 'complex': {
			const { left, right, combinator } = selector;
			const matchLeft = selectorToMatch(left);
			const matchRight = selectorToMatch(right);
			let leftMatches = new WeakSet();
			return (node: Node, parent?: Node, i: number = 0) => {
				if (matchLeft(node)) {
					leftMatches.add(node);
				} else if (parent && leftMatches.has(parent) && combinator === ' ') {
					leftMatches.add(node);
				}
				if (!matchRight(node)) return false;
				switch (combinator) {
					case ' ': // fall-through
					case '>':
						return parent ? leftMatches.has(parent) : false;
					case '~': {
						if (!parent) return false;
						for (let sibling of parent.children.slice(0, i)) {
							if (leftMatches.has(sibling)) return true;
						}
						return false;
					}
					case '+': {
						if (!parent) return false;
						let prevSiblings = parent.children
							.slice(0, i)
							.filter((el: Node) => el.type === ELEMENT_NODE);
						if (prevSiblings.length === 0) return false;
						const prev = prevSiblings[prevSiblings.length - 1];
						if (!prev) return false;
						if (leftMatches.has(prev)) return true;
					}
					default:
						return false;
				}
			};
		}
		default:
			return createMatch(selector!) as Matcher;
	}
};
