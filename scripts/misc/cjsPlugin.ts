import { Plugin } from "esbuild";
import { readFile } from "fs/promises";

const red = (message: string) => `\x1b[31m${message}\x1b[0m`;

export const cjsPlugin: Plugin = {
  name: "cinnamon",
  setup(build) {
    build.onLoad({ filter: /applet\.ts$/ }, async (args) => {
      let contents = await readFile(args.path, "utf8");

      contents = contents.replace(/import.*/g, (match: string) => {
        const tokens = tokenize(match);

        let tokenIndex = 0;
        const eat = (expected?: Token["type"], text?: string) => {
          const token = tokens[tokenIndex++];
          if (token) {
            if (
              (expected && token.type !== expected) ||
              (text && text !== token.text)
            ) {
              console.trace(
                red(`${token.type} !== ${expected} : ${token.text} !== ${text}`)
              );
              process.exit(-1);
            }
          }
          return token;
        };

        const peek = (expected?: Token["type"], text?: string) => {
          const token = tokens[tokenIndex];

          if (text) {
            return token.type === expected && token.text === text;
          } else {
            return token.type === expected;
          }
        };

        eat("import");

        const declerations: Token[] = [];
        let decleration: Token | null = null;

        let token = eat();

        if (token.type === "type") {
          return "";
        }

        if (token.type === "identifier") {
          decleration = token;

          if (peek("punctuation")) {
            token = eat("punctuation", ",");

            token = eat("punctuation", "{");
            while (true) {
              token = eat("identifier");

              declerations.push(token);

              if (peek("punctuation", ",")) {
                eat("punctuation");
              }

              if (peek("punctuation", "}")) {
                break;
              }
            }
            token = eat("punctuation", "}");
          }
        } else if (token.type === "punctuation") {
          while (true) {
            token = eat("identifier");

            declerations.push(token);

            if (peek("punctuation", ",")) {
              eat("punctuation");
            }

            if (peek("punctuation", "}")) {
              break;
            }
          }
          token = eat("punctuation", "}");
        }

        eat("from");

        const importName = eat("string");

        eat("punctuation");

        const lines: string[] = [];

        if (decleration) {
          lines.push(`const ${decleration.text} = imports.${importName.text};`);
        }

        if (declerations.length > 0) {
          lines.push(
            `const { ${declerations
              .map((d) => d.text)
              .join(", ")} } = imports.${importName.text};`
          );
        }

        return lines.join("\n");
      });

      contents = contents.replace("export default main;", "");

      return {
        contents: contents,
        loader: args.path.endsWith(".ts") ? "ts" : "js",
      };
    });
  },
};

function tokenize(content: string): Token[] {
  let remaining = content;
  const tokens: Token[] = [];

  while (remaining.length > 0) {
    remaining = consumeWhitespace(remaining);
    remaining = consumePunctuation(remaining, tokens);
    remaining = consumeString(remaining, tokens);
    remaining = consumeIdentifier(remaining, tokens);
    remaining = consumeUnknown(remaining, tokens);
  }

  return tokens;
}

function consumeWhitespace(content: string): string {
  let consumed = 0;
  while (consumed < content.length && isWhitespace(content[consumed])) {
    consumed++;
  }
  return content.slice(consumed);
}

function consumeString(content: string, tokens: Token[]): string {
  if (content.length > 0 && (content[0] === '"' || content[0] === "'")) {
    const delimiter = content[0];
    let consumed = 1;
    let stringValue = "";
    while (consumed < content.length && content[consumed] !== delimiter) {
      stringValue += content[consumed];
      consumed++;
    }
    if (consumed < content.length && content[consumed] === delimiter) {
      tokens.push({ type: "string", text: stringValue });
      return content.slice(consumed + 1);
    }
  }
  return content;
}

function consumeIdentifier(content: string, tokens: Token[]): string {
  if (content.length > 0 && isIdentifierStart(content[0])) {
    let consumed = 1;
    while (consumed < content.length && isIdentifierPart(content[consumed])) {
      consumed++;
    }
    const identifier = content.slice(0, consumed);
    switch (identifier) {
      case "import":
        tokens.push({ type: "import", text: identifier });
        break;
      case "from":
        tokens.push({ type: "from", text: identifier });
        break;
      case "type":
        tokens.push({ type: "type", text: identifier });
        break;
      default:
        tokens.push({ type: "identifier", text: identifier });
        break;
    }
    return content.slice(consumed);
  }
  return content;
}

function consumePunctuation(content: string, tokens: Token[]): string {
  if (content.length > 0 && isPunctuation(content[0])) {
    tokens.push({ type: "punctuation", text: content[0] });
    return content.slice(1);
  }
  return content;
}

function consumeUnknown(content: string, tokens: Token[]): string {
  let consumed = 0;
  while (
    consumed < content.length &&
    !isWhitespace(content[consumed]) &&
    !isPunctuation(content[consumed]) &&
    content[consumed] !== '"' &&
    content[consumed] !== "'"
  ) {
    consumed++;
  }
  if (consumed > 0) {
    const unknown = content.slice(0, consumed);
    tokens.push({ type: "unknown", text: unknown });
    return content.slice(consumed);
  }
  return content;
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function isPunctuation(char: string): boolean {
  return "(){}[],:;.".includes(char) || "+-*/%&|^!=<>~?".includes(char);
}

function isIdentifierStart(char: string): boolean {
  return (
    (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_"
  );
}

function isIdentifierPart(char: string): boolean {
  return isIdentifierStart(char) || (char >= "0" && char <= "9");
}

interface Token {
  type:
    | "import"
    | "from"
    | "type"
    | "identifier"
    | "string"
    | "punctuation"
    | "unknown";
  text: string;
}
