import { Fragment, h } from '../index.js';

function jsx(type: any, props: Record<string, any> | null) {
	const { children, ...attributes } = props ?? {};
	const childNodes =
		children === undefined
			? []
			: Array.isArray(children)
				? children
				: [children];
	return h(type, attributes, ...childNodes);
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
