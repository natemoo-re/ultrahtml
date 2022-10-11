export interface Node {
  type: number;
  [key: string]: any;
}

export const DOCUMENT_NODE = 0;
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 2;
export const COMMENT_NODE = 3;
export const DOCTYPE_NODE = 4;

const VOID_TAGS = { img: 1, br: 1, hr: 1, meta: 1, link: 1, base: 1, input: 1 };
const SPLIT_ATTRS_RE = /([\@\.a-z0-9_\:\-]*)\s*?=?\s*?(['"]?)(.*?)\2\s+/gim;
const DOM_PARSER_RE =
  /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!)([\s\S]*?)(>))/gm;

function splitAttrs(str?: string) {
  let obj: Record<string, string> = {};
  let token: any;
  if (str) {
    SPLIT_ATTRS_RE.lastIndex = 0;
    str = " " + (str || "") + " ";
    while ((token = SPLIT_ATTRS_RE.exec(str))) {
      if (token[0] === " ") continue;
      obj[token[1]] = token[3];
    }
  }
  return obj;
}

export function parse(input: string | ReturnType<typeof html>): any {
  let str = typeof input === "string" ? input : input.value;
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
    children: [],
  };

  let lastIndex = 0;
  function commitTextNode() {
    text = str.substring(lastIndex, DOM_PARSER_RE.lastIndex - token[0].length);
    if (text) {
      parent.children.push({
        type: TEXT_NODE,
        value: text,
        parent
      })
    }
  }

  while ((token = DOM_PARSER_RE.exec(str))) {
    bStart = token[5] || token[8];
    bText = token[6] || token[9];
    bEnd = token[7] || token[10];
    if (bStart === "<!--") {
      i = DOM_PARSER_RE.lastIndex - token[0].length;
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
      };
      tags.push(tag);
      tag.parent.children.push(tag);
    } else if (bStart === "<!") {
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
    } else if (token[1] !== "/") {
      commitTextNode();
      tag = {
        type: ELEMENT_NODE,
        name: token[2] + "",
        attributes: splitAttrs(token[3]),
        parent,
        children: [],
        loc: [
          {
            start: DOM_PARSER_RE.lastIndex - token[0].length,
            end: DOM_PARSER_RE.lastIndex,
          },
        ],
      };
      tags.push(tag);
      tag.parent.children.push(tag);
      if (
        (token[4] && token[4].indexOf("/") > -1) ||
        VOID_TAGS.hasOwnProperty(tag.name)
      ) {
        tag.loc[1] = tag.loc[0];
        tag.isSelfClosingTag = true;
      } else {
        parent = tag;
      }
    } else {
      commitTextNode();
      // Close parent node if end-tag matches
      if (token[2] + "" === parent.name) {
        tag = parent;
        parent = tag.parent;
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
        token[2] + "" === tags[tags.length - 1].name &&
        tags[tags.length - 1].isSelfClosingTag === true
      ) {
        tag = tags[tags.length - 1];
        tag.loc.push({
          start: DOM_PARSER_RE.lastIndex - token[0].length,
          end: DOM_PARSER_RE.lastIndex,
        });
      }
    }
    lastIndex = DOM_PARSER_RE.lastIndex
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

class Walker {
  constructor(private callback: Visitor) {}
  async visit(node: Node, parent?: Node, index?: number): Promise<void> {
    await this.callback(node, parent, index);
    if (Array.isArray(node.children)) {
      let promises = [];
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        promises.push(this.visit(child, node, i));
      }
      await Promise.all(promises);
    }
  }
}

const HTMLString = Symbol("HTMLString");
const AttrString = Symbol("AttrString");
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

const ESCAPE_CHARS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};
function escapeHTML(str: string): string {
  return str.replace(/[&<>]/g, (c) => ESCAPE_CHARS[c] || c);
}
export function attrs(attributes: Record<string, string>) {
  let attrStr = "";
  for (const [key, value] of Object.entries(attributes)) {
    attrStr += ` ${key}="${value}"`;
  }
  return mark(attrStr, [HTMLString, AttrString]);
}
export function html(tmpl: TemplateStringsArray, ...vals: any[]) {
  let buf = "";
  for (let i = 0; i < tmpl.length; i++) {
    buf += tmpl[i];
    const expr = vals[i];
    if (buf.endsWith("...") && expr && typeof expr === "object") {
      buf = buf.slice(0, -3).trimEnd();
      buf += attrs(expr).value;
    } else if (expr && expr[AttrString]) {
      buf = buf.trimEnd();
      buf += expr.value;
    } else if (expr && expr[HTMLString]) {
      buf += expr.value;
    } else if (typeof expr === "string") {
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

export interface SanitizeOptions {
  /** An Array of strings indicating elements that the sanitizer should not remove. All elements not in the array will be dropped. */
  allowElements?: string[];
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
export interface RenderOptions {
  sanitize?: SanitizeOptions | boolean;
  components?: {
    [tag: string]:
      | string
      | ((
          attrs: Record<string, any>,
          children: ReturnType<typeof html>
        ) => ReturnType<typeof html>);
  };
}

function resolveSantizeOptions({
  components = {},
  sanitize = true,
}: RenderOptions): SanitizeOptions {
  if (sanitize === true) {
    return {
      allowElements: Object.keys(components),
      dropElements: ["script"],
      allowComponents: false,
      allowCustomElements: false,
      allowComments: false,
    };
  } else if (sanitize === false) {
    return {
      dropElements: [],
      allowComponents: true,
      allowCustomElements: true,
      allowComments: true,
    };
  } else {
    const dropElements = new Set<string>([]);
    if (!sanitize.allowElements?.includes("script")) {
      dropElements.add("script");
    }
    for (const dropElement of sanitize.dropElements ?? []) {
      dropElements.add(dropElement);
    }
    return {
      allowComponents: false,
      allowCustomElements: false,
      allowComments: false,
      ...sanitize,
      allowElements: [
        ...Object.keys(components),
        ...(sanitize.allowElements ?? []),
      ],
      dropElements: Array.from(dropElements),
    };
  }
}

type NodeType = "element" | "component" | "custom-element";
function getNodeType(node: Node): NodeType {
  if (node.name.includes("-")) return "custom-element";
  if (/[\_\$A-Z]/.test(node.name[0]) || node.name.includes("."))
    return "component";
  return "element";
}

type ActionType = "allow" | "drop" | "block";
function getAction(
  name: string,
  type: NodeType,
  sanitize: Required<SanitizeOptions>
): ActionType {
  if (sanitize.allowElements?.length > 0) {
    if (sanitize.allowElements.includes(name)) return "allow";
  }
  if (sanitize.blockElements?.length > 0) {
    if (sanitize.blockElements.includes(name)) return "block";
  }
  if (sanitize.dropElements?.length > 0) {
    if (sanitize.dropElements.find((n) => n === name)) return "drop";
  }
  if (type === "component" && !sanitize.allowComponents) return "drop";
  if (type === "custom-element" && !sanitize.allowCustomElements) return "drop";
  return "allow";
}

function sanitizeAttributes(
  node: Node,
  sanitize: Required<SanitizeOptions>
): Record<string, string> {
  const attrs: Record<string, string> = node.attributes;
  for (const key of Object.keys(node.attributes)) {
    if (
      (sanitize.allowAttributes?.[key] &&
        sanitize.allowAttributes?.[key].includes(node.name)) ||
      sanitize.allowAttributes?.[key].includes("*")
    ) {
      continue;
    }
    if (
      (sanitize.dropAttributes?.[key] &&
        sanitize.dropAttributes?.[key].includes(node.name)) ||
      sanitize.dropAttributes?.[key].includes("*")
    ) {
      delete attrs[key];
    }
  }
  return attrs;
}

async function renderElement(
  node: Node,
  opts: Required<RenderOptions>
): Promise<string> {
  const type = getNodeType(node);
  const { name } = node;
  const action = getAction(
    name,
    type,
    opts.sanitize as Required<SanitizeOptions>
  );
  if (action === "drop") return "";
  if (action === "block")
    return await Promise.all(
      node.children.map((child: Node) => render(child, opts))
    ).then((res) => res.join(""));

  const component = opts.components[node.name];
  if (typeof component === "string")
    return renderElement({ ...node, name: component }, opts);
  const attributes = sanitizeAttributes(
    node,
    opts.sanitize as Required<SanitizeOptions>
  );
  if (typeof component === "function") {
    const value = await component(
      attributes,
      mark(
        await Promise.all(
          node.children.map((child: Node) => render(child, opts))
        ).then((res) => res.join(""))
      )
    );
    if (value && (value as any)[HTMLString]) return value.value;
    return escapeHTML(String(value));
  }
  if (VOID_TAGS.hasOwnProperty(name)) {
    return `<${node.name}${attrs(attributes).value}>`;
  }
  return `<${node.name}${attrs(attributes).value}>${await Promise.all(
    node.children.map((child: Node) => render(child, opts))
  ).then((res) => res.join(""))}</${node.name}>`;
}

export async function render(
  node: Node,
  opts: RenderOptions = {}
): Promise<string> {
  const sanitize = resolveSantizeOptions(opts);
  switch (node.type) {
    case DOCUMENT_NODE: {
      return Promise.all(
        node.children.map((child: Node) => render(child, opts))
      ).then((res) => res.join(""));
    }
    case ELEMENT_NODE:
      return renderElement(node, {
        components: opts.components ?? {},
        sanitize,
      });
    case TEXT_NODE: {
      return `${node.value}`;
    }
    case COMMENT_NODE: {
      if (sanitize.allowComments) {
        return `<!--${node.value}-->`;
      } else {
        return "";
      }
    }
    case DOCTYPE_NODE: {
      return `<!${node.value}>`;
    }
  }
  return "";
}

export async function transform(
  input: string | ReturnType<typeof html>,
  opts: RenderOptions = {}
) {
  return render(parse(input), opts);
}
