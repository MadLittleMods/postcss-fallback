[![npm version](https://badge.fury.io/js/postcss-fallback.svg)](http://badge.fury.io/js/postcss-fallback) [![Build Status](https://travis-ci.org/MadLittleMods/postcss-fallback.svg)](https://travis-ci.org/MadLittleMods/postcss-fallback)

# PostCSS Fallback

[PostCSS](https://github.com/postcss/postcss) plugin to provide fallback values for properties without having duplicate declarations.

Works great with the [`stylelint`](https://github.com/stylelint/stylelint) [`rule-no-duplicate-properties`](https://github.com/stylelint/stylelint/blob/master/src/rules/rule-no-duplicate-properties/README.md) rule.

### [Changelog](https://github.com/MadLittleMods/postcss-fallback/blob/master/CHANGELOG.md)

### Install

`npm install postcss-fallback --save-dev`

# Usage

## Basic Example

```js
var postcss = require('postcss');
var fallback = require('postcss-fallback');

var fs = require('fs');

var mycss = fs.readFileSync('input.css', 'utf8');

// Process your CSS with postcss-fallback
var output = postcss([
		fallback(/*options*/)
	])
	.process(mycss)
	.css;

console.log(output);
```

Input:
```css
.foo {
	display: fallback(flex, inline-block);
	width: fallback(45vh, 450px);

	background-color: fallback(rgba(0, 0, 0, 0.5), #555555);
	foo: fallback(bar, baz, qux, corge);
}
```

Output:
```css
.foo {
	display: inline-block;
	display: flex;
	width: 450px;
	width: 45vh;

	background-color: #555555;
	background-color: rgba(0, 0, 0, 0.5);
	foo: corge;
	foo: qux;
	foo: baz;
	foo: bar;
}
```


# Options

 - `keyword`: string - The fallback function keyword.
 	 - Default: `'fallback'`


# Testing

`npm test`
