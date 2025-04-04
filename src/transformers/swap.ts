import { ElementNode, RenderFn } from '../index.js';
import { Node, __unsafeRenderFn } from '../index.js';
import { querySelectorAll } from '../selector.js';

export default function swap(
	components: Record<
		string,
		string | ((props: Record<string, any>, ...children: any[]) => any)
	> = {},
) {
	return (doc: Node): Node => {
		for (const [selector, component] of Object.entries(components)) {
			for (const node of querySelectorAll(doc, selector)) {
				if (typeof component === 'string') {
					node.name = component;
					if (RenderFn in node) {
						delete (node as any)[RenderFn];
					}
				} else if (typeof component === 'function') {
					__unsafeRenderFn(node as ElementNode, component);
				}
			}
		}
		return doc;
	};
}
