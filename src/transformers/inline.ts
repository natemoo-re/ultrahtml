import { walkSync, ELEMENT_NODE, TEXT_NODE, Node } from "../index.js";
import { querySelectorAll, specificity } from "../selector.js";
import { compile } from "stylis";

export default function inline() {
  return (doc: Node): Node => {
    const style: string[] = [];
    const actions: (() => void)[] = [];
    walkSync(doc, (node: Node, parent?: Node) => {
      if (node.type === ELEMENT_NODE && node.name === "style") {
        style.push(
          node.children
            .map((c: Node) => (c.type === TEXT_NODE ? c.value : ""))
            .join("")
        );
        actions.push(() => {
          parent!.children = parent!.children.filter((c: Node) => c !== node);
        });
      }
    });
    for (const action of actions) {
      action();
    }
    const styles = style.join("\n");
    const css = compile(styles);
    const selectors = new Map<string, Record<string, string>>();
    for (const rule of css) {
      if (rule.type === "rule") {
        const rules = Object.fromEntries(
          (rule.children as unknown as Element[])
            .map((child: any) => [child.props, child.children])
        );
        for (const selector of rule.props) {
          const value = Object.assign(selectors.get(selector) ?? {}, rules);
          selectors.set(selector, value);
        }
      }
    }

    const rules = new Map<Node, Record<string, string>>();
    for (const [selector, styles] of Array.from(selectors).sort(([a], [b]) => {
      const $a = specificity(a);
      const $b = specificity(b);
      if ($a > $b) return 1;
      if ($b > $a) return -1;
      return 0;
    })) {
      const nodes = querySelectorAll(doc, selector);
      for (const node of nodes) {
        const curr = rules.get(node) ?? {};
        rules.set(node, Object.assign(curr, styles));
      }
    }

    for (const [node, rule] of rules) {
      let style = node.attributes.style ?? "";
      let styleObj: Record<string, string> = {};
      for (const decl of compile(style)) {
        if (decl.type === "decl") {
          if (
            typeof decl.props === "string" &&
            typeof decl.children === "string"
          ) {
            styleObj[decl.props] = decl.children;
          }
        }
      }
      styleObj = Object.assign({}, rule, styleObj);
      node.attributes.style = `${Object.entries(styleObj)
        .map(([decl, value]) => `${decl}:${value.replace("!important", "")};`)
        .join("")}`;
    }
    return doc;
  };
}
