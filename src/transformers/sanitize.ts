import { ElementNode, ELEMENT_NODE, Node, walkSync } from '../index.js';

export interface SanitizeOptions {
	/** An Array of strings indicating elements that the sanitizer should not remove. All elements not in the array will be dropped. */
	allowElements?: string[];
	/** An Array of strings indicating elements that the sanitizer should not remove. All elements not in the array will be removed while keeping their child content. */
	unblockElements?: string[];
	/** An Array of strings indicating elements that the sanitizer should remove, but keeping their child elements. */
	blockElements?: string[];
	/** An Array of strings indicating elements (including nested elements) that the sanitizer should remove. */
	dropElements?: string[];
	/** An Object where each key is the attribute name and the value is an Array of allowed tag names. Matching attributes will not be removed. All attributes that are not in the array will be dropped. */
	allowAttributes?: Record<string, string[]>;
	/** An Object where each key is the attribute name and the value is an Array of dropped tag names. Matching attributes will be removed. */
	dropAttributes?: Record<string, string[]>;
	/** A Boolean value set to false (default) to remove components and their children. If set to true, components will be subject to built-in and custom configuration checks (and will be retained or dropped based on those checks). */
	allowComponents?: boolean;
	/** A Boolean value set to false (default) to remove custom elements and their children. If set to true, custom elements will be subject to built-in and custom configuration checks (and will be retained or dropped based on those checks). */
	allowCustomElements?: boolean;
	/** A Boolean value set to false (default) to remove HTML comments. Set to true in order to keep comments. */
	allowComments?: boolean;
}

function resolveSantizeOptions(
	sanitize?: SanitizeOptions,
): Required<SanitizeOptions> {
	if (sanitize === undefined) {
		return {
			allowElements: [] as string[],
			dropElements: ['script'],
			allowComponents: false,
			allowCustomElements: false,
			allowComments: false,
		} as Required<SanitizeOptions>;
	} else {
		const dropElements = new Set<string>([]);
		if (!sanitize.allowElements?.includes('script')) {
			dropElements.add('script');
		}
		for (const dropElement of sanitize.dropElements ?? []) {
			dropElements.add(dropElement);
		}
		return {
			allowComponents: false,
			allowCustomElements: false,
			allowComments: false,
			...sanitize,
			dropElements: Array.from(dropElements),
		} as Required<SanitizeOptions>;
	}
}

type NodeKind = 'element' | 'component' | 'custom-element';
function getNodeKind(node: ElementNode): NodeKind {
	if (node.name.includes('-')) return 'custom-element';
	if (/[\_\$A-Z]/.test(node.name[0]) || node.name.includes('.'))
		return 'component';
	return 'element';
}

type ActionType = 'allow' | 'drop' | 'block';
function getAction(
	name: string,
	kind: NodeKind,
	sanitize: Required<SanitizeOptions>,
): ActionType {
	if (sanitize.allowElements?.length > 0) {
		if (sanitize.allowElements.includes(name)) return 'allow';
	}
	if (sanitize.blockElements?.length > 0) {
		if (sanitize.blockElements.includes(name)) return 'block';
	}
	if (sanitize.dropElements?.length > 0) {
		if (sanitize.dropElements.find((n) => n === name)) return 'drop';
	}
	if (kind === 'component' && !sanitize.allowComponents) return 'drop';
	if (kind === 'custom-element' && !sanitize.allowCustomElements) return 'drop';
	if (sanitize.unblockElements) {
		return sanitize.unblockElements.some((n) => n === name) ? 'allow' : 'block';
	}
	return sanitize.allowElements?.length > 0 ? 'drop' : 'allow';
}

function sanitizeAttributes(
	node: ElementNode,
	sanitize: Required<SanitizeOptions>,
): Record<string, string> {
	const attrs: Record<string, string> = node.attributes;
	for (const key of Object.keys(node.attributes)) {
		if (
			(sanitize.allowAttributes?.[key] &&
				sanitize.allowAttributes?.[key].includes(node.name)) ||
			sanitize.allowAttributes?.[key]?.includes('*')
		) {
			continue;
		}
		if (
			(sanitize.dropAttributes?.[key] &&
				sanitize.dropAttributes?.[key].includes(node.name)) ||
			sanitize.dropAttributes?.[key]?.includes('*')
		) {
			delete attrs[key];
		}
	}
	return attrs;
}

function sanitizeElement(
	opts: Required<SanitizeOptions>,
	node: ElementNode,
	parent: Node,
) {
	const kind = getNodeKind(node);
	const { name } = node;
	const action = getAction(name, kind, opts);
	if (action === 'drop')
		return () => {
			parent!.children = parent!.children.filter(
				(child: Node) => child !== node,
			);
		};
	if (action === 'block')
		return () => {
			parent!.children = parent!.children
				.map((child: Node) => (child === node ? child.children : child))
				.flat(1);
		};

	return () => {
		node.attributes = sanitizeAttributes(node, opts);
	};
}

export default function sanitize(opts?: SanitizeOptions) {
	const sanitize = resolveSantizeOptions(opts);
	return (doc: Node): Node => {
		let actions: any[] = [];
		walkSync(doc, (node: Node, parent?: Node) => {
			switch (node.type) {
				case ELEMENT_NODE: {
					actions.push(sanitizeElement(sanitize, node, parent!));
					return;
				}
				default:
					return;
			}
		});
		// Execute actions in reverse order so that children are mutated before parents.
		for (let i = actions.length - 1; i >= 0; i--) {
			actions[i]();
		}
		return doc;
	};
}
