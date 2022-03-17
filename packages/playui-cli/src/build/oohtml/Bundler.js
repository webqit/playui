
/**
 * @imports
 */
import Fs from 'fs';
import Path from 'path';
import { _merge } from '@webqit/util/obj/index.js';
import { _isFunction } from '@webqit/util/js/index.js';
import { _before, _beforeLast, _after } from '@webqit/util/str/index.js';
import Lexer from '@webqit/util/str/Lexer.js';
import _Bundler from '../_Bundler.js';

/**
 * ---------------------------
 * The Bundler class
 * ---------------------------
 */
export default class Bundler extends _Bundler {
		
	/**
	 * A Bundler instance.
	 *
	 * @param string		baseDir
	 * @param object		params
	 *
	 * @return void
	 */
	constructor(baseDir, params = {}) {
		super(baseDir, params);
		// ----------------------------------------
		const divideByComment = tag => {
			var _comment = '', _tag;
			if (tag.startsWith('<!--')) {
				_comment = _before(tag, '-->') + '-->';
				_tag = _after(tag, '-->');
			} else {
				_tag = tag;
			}
			// Shift whitespace too
			_comment += _before(_tag, '<');
			tag = '<' + _after(_tag, '<');
			return [_comment, _tag];
		};
		// ----------------------------------------
		this.params.getAttributeDefinition = (tag, attributeName) => {
			var [ comment, tag ] = divideByComment(tag);
			// --------------
			var regexes = [' ' + attributeName + '([ ]+)?=([ ]+)?"([^"])+"', " " + attributeName + "([ ]+)?=([ ]+)?'([^'])+'"];
			return regexes.reduce((result, regex) => {
				return result || Lexer.match(tag, regex, {stopChars: '>', useRegex:'i', blocks:[]})[0];
			}, '');
		};
		this.params.defineAttribute = (tag, attributeName, attributeValue) => {
			var [ comment, tag ] = divideByComment(tag);
			if (!tag) {
				return comment;
			}
			// --------------
			var [tagEnd] = tag.split('').reduce(([a, quotes], char, i) => {
				if (a) return [a];
				if (["'", '"'].includes(char)) {
					if (quotes[0] === char) quotes.splice(0);
					else quotes.push(char);
				} else if (!quotes.length && char === '>') {
					return [i];
				}
				return [null, quotes];
			}, [null, []]);
			var parts = [tag.substring(0, tagEnd), tag.substring(tagEnd + 1)];
			var isSelfClosingTag = parts[0].trim().endsWith('/');
			return comment + (isSelfClosingTag ? _beforeLast(parts[0], '/') : parts[0]) + ' ' + attributeName + '="' + attributeValue + '"' + (isSelfClosingTag ? ' /' : '') +  '>' + parts[1];
		};
		// -----------------------------------------
	}
		
	/**
	 * Loads a file and appends it
	 * to the bundle on the specified namespace.
	 *
	 * @param string		file
	 * @param object		params
	 *
	 * @return string|function
	 */
	load(file, params) {
		var ext = Path.extname(file) || '';
		var exportGroup = _beforeLast(Path.basename(file), '.').toLowerCase();
		var createExport = (content, exportGroup) => {
			if (params.EXPORT_MODE === 'element' && params.EXPORT_ELEMENT && params.EXPORT_ID_ATTR) {
				return '<' + params.EXPORT_ELEMENT + ' ' + params.EXPORT_ID_ATTR + '="' + exportGroup + '">' + content + '</' + params.EXPORT_ELEMENT + '>';
			} else if (params.EXPORT_MODE === 'attribute' && params.EXPORT_GROUP_ATTR && !params.getAttributeDefinition(content, params.EXPORT_GROUP_ATTR)) {
				return params.defineAttribute(content, params.EXPORT_GROUP_ATTR, exportGroup);
			}
			return content;
		};
		if (ext in Bundler.mime) {
			return assetsDir => {
				if (Fs.statSync(file).size < params.MAX_DATA_URL_SIZE) {
					var url = 'data:' + Bundler.mime[ext] + ';base64,' + Fs.readFileSync(file).toString('base64');
				} else {
					var absFilename = Path.join(assetsDir || this.baseDir, Path.basename(file));
					if (assetsDir !== Path.resolve(this.baseDir)) {
						Fs.mkdirSync(Path.dirname(absFilename), {recursive:true});
						Fs.copyFileSync(file, absFilename);
					}
					var assetsPublicFilename = getPublicFilename(absFilename, params.indentation);
					var url = Path.join(params.ASSETS_PUBLIC_BASE, assetsPublicFilename);
				}
				var img = `<img src="${url}" />`;
				return createExport(img, exportGroup);
			};
		} else {
			var contents = Fs.readFileSync(file).toString();
			var contentsTrimmed = contents.trim();
			if (contentsTrimmed.startsWith('<') && !contentsTrimmed.startsWith('<!DOCTYPE') && !contentsTrimmed.startsWith('<?xml')) {
				return createExport(contentsTrimmed, exportGroup);
			}
		}
	}
		
	/**
	 * Stringifies the bundle
	 * and optionally saves it to a Path.
	 *
	 * @param string			outputFile
	 * @param string			assetsStorageBase
	 * @param object			outline
	 * @param string			name
	 *
	 * @return string
	 */
	output(outputFile = null, assetsStorageBase = null, outline = {}, name = null) {
		// -----------------------------------------
		// The following will happen when not recursing by virtue of Path.isAbsolute()
		if (outputFile && !Path.isAbsolute(outputFile)) {
			outputFile = Path.resolve(this.baseDir, outputFile);
		}
		if (!assetsStorageBase) {
			outpuassetsStorageBasetDir = Path.dirname(outputFile);
		} else if (!Path.isAbsolute(assetsStorageBase)) {
			assetsStorageBase = Path.resolve(this.baseDir, assetsStorageBase);
		}
		// -----------------------------------------
		var t = "\t".repeat(this.params.indentation + 1),
			t2 = "\t".repeat(this.params.indentation);
		var contents = "\r\n" + t + Object.keys(this.outline).map(name => {
			var entry = this.outline[name];
			if (entry instanceof Bundler) {
				if (!outline.subtree) {
					outline.subtree = {};
				}
				outline.subtree[name] = {};
				return entry.output(outputFile, Path.join(assetsStorageBase, name), outline.subtree[name], name);
			}
			if (!outline.meta) {
				outline.meta = {};
			}
			outline.meta[name] = entry.meta;
			return _isFunction(entry.content) ? entry.content(assetsStorageBase) : entry.content;
		}).join("\r\n\r\n" + t) + "\r\n" + t2;
		// -----------------------------------------
		var src;
		if (!name) {
			Fs.mkdirSync(Path.dirname(outputFile), {recursive:true});
			Fs.writeFileSync(outputFile, contents);
			if (this.params.CREATE_OUTLINE_FILE) {
				var outlineFile = outputFile + '.json';
				if (Fs.existsSync(outlineFile) && this.params.CREATE_OUTLINE_FILE === 'create_merge') {
					outline = _merge(100, {}, JSON.parse(Fs.readFileSync(outlineFile)), outline);
				}
				Fs.writeFileSync(outlineFile, JSON.stringify(outline, null, 4));
			}
			src = getPublicFilename(outputFile, this.params.indentation);
		}
		// -----------------------------------------
		return `<template${
				((this.params.MODULE_EXT || '').trim() ? ' is="' + this.params.MODULE_EXT + '"' : '') + (name ? ' ' + this.params.MODULE_ID_ATTR + '="' + name + '"' : '') + (src ? ' src="' + src + '"' : '')
			}>${(!src ? contents : '')}</template>`;
	}	
}

/**
 * @var object
 */
Bundler.mime = {
	'.ico': 'image/x-icon',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
};

/**
 * @var function
 */
export const getPublicFilename = (filename, indentation) => {
	return filename.replace(/\\/g, '/').split('/').slice(- (indentation + 1)).join('/');
};
