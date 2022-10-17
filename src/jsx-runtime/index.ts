import { ElementNode, Node, TEXT_NODE } from "../index.js";
import { ELEMENT_NODE, Fragment, __unsafeRenderFn } from "../index.js";

function createVNode(
  type: any,
  { children, ...attributes }: Record<string, any>,
  key: string,
  __self: string,
  __source: string
) {
  const vnode: ElementNode = {
    type: ELEMENT_NODE,
    name: typeof type === "function" ? type.name : type,
    attributes,
    children: (Array.isArray(children) ? children : [children]).map((child) => {
      if (typeof child === "string") {
        return {
          type: TEXT_NODE,
          value: child,
        };
      }
      return child;
    }),
    parent: undefined as any,
    loc: [] as any,
  };

  if (typeof type === "function") {
    __unsafeRenderFn(vnode, type);
  }

  return vnode;
}

export {
  createVNode as jsx,
  createVNode as jsxs,
  createVNode as jsxDEV,
  Fragment,
};
