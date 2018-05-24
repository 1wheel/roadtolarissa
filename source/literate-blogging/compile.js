// https://github.com/vijithassar/lit-web/blob/master/source/compile.js

// test whether the line starts with backticks
const is_fence = line => line.slice(0, 3) === '```';

// test whether the line starts with backticks followed by a javascript language specifier
const is_javascript_fence = line => line.slice(0, 5) === '```js' || line.slice(0, 13) === '```javascript';

// count backtick fences to make sure they are balanced
const balanced_fences = code => code.split('```').length % 2 !== 0;

// extract JavaScript code blocks from a Markdown string
const compile = markdown => {
    // exit immediately if backticks aren't balanced
    if (! balanced_fences(markdown)) {
        return;
    }
    // split into lines
    const lines = markdown.split("\n");
    // count backticks
    let fence_count = 0;
    // comment out Markdown
    const code = lines
        .map(line => {
            const fence = is_fence(line);
            const javascript_fence = fence ? is_javascript_fence(line) : false;
            // increment the fence count if it's a valid
            // opening or closing fence
            if (javascript_fence || (fence && fence_count % 2 === 1)) {
                fence_count += 1;
                if (fence_count % 2 === 0) return ''
            }
            // are we currently inside a code block
            // or a Markdown documentation passage?
            const is_markdown = fence_count % 2 === 0 || fence;
            if (is_markdown) {
                return null;
            } else {
                return line;
            }
        })
        .filter(d => d !== null)

    return code.join("\n").trim();
};

var fs = require('fs')

fs.writeFileSync('index.js', compile(fs.readFileSync('../_posts/2017-11-12-literate-blogging.md', 'utf8')))

