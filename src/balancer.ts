export function isBalanced(sourceCode = ''): boolean {
	function checkBalance(code: string): boolean {
		const bracketPairs: Partial<Record<Bracket, Bracket>> = {
			')': '(',
			']': '[',
			'}': '{',
		};
		const stack: Bracket[] = [];
		const bracketRegex = /[()[{}\]]/g;

		let match: RegExpExecArray | null;
		while ((match = bracketRegex.exec(code)) !== null) {
			const char = match[0] as Bracket;
			if ('([{'.includes(char)) {
				stack.push(char);
			} else if (stack.length === 0 || stack.pop() !== bracketPairs[char]) {
				return false;
			}
		}

		return stack.length === 0;
	}

	return checkBalance(preprocess(sourceCode));
}

type Bracket = ')' | ']' | '}' | '{' | '[' | '(';

function replaceWithWhitespace(input: string, pattern: RegExp): string {
	return input.replace(pattern, (match) => ' '.repeat(match.length));
}

function preprocess(code: string): string {
	const patterns = [
		// single-line comments
		/\/\/.*$/gm,
		// multi-line comments
		/\/\*[\s\S]*?\*\//g,
		// string literals (both single and double quotes), handling escaped quotes
		/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g,
		// regex literals, handling escaped forward slashes
		/\/(?:[^\/\\]|\\.)*\/[gimsuy]*/g,
		// Handle escaped brackets outside of strings and regexes
		/\\[()[{}\]]/g,
	];
	let result = code;
	for (const pattern of patterns) {
		result = replaceWithWhitespace(result, pattern);
	}
	return result;
}
