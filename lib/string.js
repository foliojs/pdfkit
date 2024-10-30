
export const sfix = (strings, ...expressions) => {
    const indent = !strings[0].startsWith('\n')
        ? null
        : new RegExp(`\n {${strings[0].match(/\n+( *)/)[1].length}}`, 'g');
    return expressions
        .reduce(
            (acc, expr, i) => `${acc}${expr}${strings[i + 1].replace(indent, '\n')}`,
            strings[0].replace(indent, '\n'),
        )
        .replace(/^\n|\n$/g, '');
};