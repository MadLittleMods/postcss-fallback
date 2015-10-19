// Test setup inspired by @ben-eb

import test from 'tape';

import postcss from 'postcss';
import perfectionist from 'perfectionist';
import plugin from '../';

import { name } from '../package.json';


let process = function(css, options) {
	return postcss([
		plugin(options),
		perfectionist({
			format: 'compressed'
		})
	])
	.process(css)
	.css
	.trim();
};

let tests = [
	{
		message: 'should gracefully handle if no arguments provided',
		fixture: '.foo{display:fallback();}',
		expected: '.foo{display:}'
	},
	{
		message: 'should gracefully handle if no arguments provided and other value pieces present',
		fixture: '.foo{border:1px solid fallback();}',
		expected: '.foo{border:1px solid }'
	},
	{
		message: 'should expand if 1 argument provided',
		fixture: '.foo{display:fallback(a);}',
		expected: '.foo{display:a}'
	},
	{
		message: 'should fallback with 2 arguments',
		fixture: '.foo{display:fallback(a, b)}',
		expected: '.foo{display:b;display:a}'
	},
	{
		message: 'should fallback with >2 arguments',
		fixture: '.foo{display: fallback(a, b, c, d);}',
		expected: '.foo{display:d;display:c;display:b;display:a}'
	},
	{
		message: 'should handle functions as arguments',
		fixture: '.foo{color:fallback(rgba(0,0,0,0.1), #000000)}',
		expected: '.foo{color:#000000;color:rgba(0,0,0,0.1)}'
	},
	{
		message: 'should handle nested functions as arguments',
		fixture: '.foo{color:fallback(color(rgba(0,0,0,0.1) alpha(0.9)),#000000)}',
		expected: '.foo{color:#000000;color:color(rgba(0,0,0,0.1) alpha(0.9))}'
	},
	{
		message: 'should work with spaces in arguments',
		fixture: '.foo{border:fallback(1px solid #000000)}',
		expected: '.foo{border:1px solid #000000}'
	},
	{
		message: 'should work with spaces in arguments and nested functions',
		fixture: '.foo{border:fallback(1px solid color(rgba(0,0,0,0.1) alpha(0.9)), 2px solid #ff0000)}',
		expected: '.foo{border:2px solid #ff0000;border:1px solid color(rgba(0,0,0,0.1) alpha(0.9))}'
	},
	{
		message: 'should work other pieces outside fallback-function',
		fixture: '.foo{border:1px solid fallback(#000000)}',
		expected: '.foo{border:1px solid #000000}'
	},
	{
		message: 'should work with multiple fallback-functions on the top-level',
		fixture: '.foo{margin:fallback(1rem, 16px) fallback(2rem, 32px)}',
		expected: '.foo{margin:16px 32px;margin:1rem 32px;margin:16px 2rem;margin:1rem 2rem}'
	},
	{
		message: 'should not remove false positive',
		fixture: '.foo{foo:fallback into something}',
		expected: '.foo{foo:fallback into something}'
	}
];


/* */
test(name, t => {
	t.plan(tests.length);

	tests.forEach(test => {
		var options = test.options || {};
		t.equal(process(test.fixture, options), test.expected, test.message);
	});
});
/* */
