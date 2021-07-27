
/**
 * @imports
 */
import Fs from 'fs';
import Path from 'path';
import { _each, _merge } from '@webqit/util/obj/index.js';
import { _isObject, _isNumeric, _isString, _isFunction } from '@webqit/util/js/index.js';
import { _before, _beforeLast, _after, _toTitle } from '@webqit/util/str/index.js';
import { _preceding, _following } from '@webqit/util/arr/index.js';
import Lexer from '@webqit/util/str/Lexer.js';

/**
 * ---------------------------
 * The Bundler class
 * ---------------------------
 */
export default class Bundler {
		
	/**
	 * Bundles and saves (multiple).
	 *
	 * @param string|object	from
	 * @param string		to
	 * @param object		params
	 *
	 * @return string|object
	 */
	static async bundle(from, to = null, params = {}) {

		if (_isString(from) && from.includes('[name]')) {
			if (Path.isAbsolute(to) && !to.matches(/\[name\]/)) {
				throw new Error('Cannot bubdle from multiple ENTRY_DIRs to the same OUTPUT_FILE without a [name] placeholder.');
			}
			var _from = from;
			from = {};
			Fs.readdirSync(_before(_from, '[name]')).forEach(name => {
				var resource = _from.replace(/\[name\]/g, name);
				if (Fs.statSync(resource).isDirectory() && !(params.IGNORE_FOLDERS_BY_PREFIX || []).filter(prfx => name.substr(0, prfx.length) === prfx).length) {
					from[name] = resource;
				}
			});
		}

		if (_isObject(from)) {
			var fromNames = Object.keys(from), bundles = {};

			var readShift = async () => {
				var name;
				if (!(name = fromNames.shift())) {
					return;
				}
				var _to = (to || '').replace(/\[name\]/g, name);
				var _params = { ...params };
				_params.ENTRY_DIR = from[name];
				_params.ASSETS_STORAGE_BASE = (params.ASSETS_STORAGE_BASE || '').replace(/\[name\]/g, name);
				_params.ASSETS_PUBLIC_BASE = (params.ASSETS_PUBLIC_BASE || '').replace(/\[name\]/g, name);
				var bundler = await Bundler.readdir(from[name], _params);
				bundles[name] = bundler.output(_to, _params.ASSETS_STORAGE_BASE);
				await readShift();
			};
			await readShift();

			return bundles;
		}

		return (await Bundler.readdir(from, params)).output(to, params.ASSETS_STORAGE_BASE);
	}

	/**
	 * Mounts a Bundler instance over a directory
	 * and runs the directory-reading and files-loading process.
	 *
	 * @param string		baseDir
	 * @param object		params
	 *
	 * @return void
	 */
	static async readdir(basePath, params) {
		const bundler = new Bundler(basePath, params);
		// --------------------------------
		var load = async (resource, paramsCopy, errors, meta) => {
			var callLoader = async function(index, resource, recieved) {
				if (bundler.params.LOADERS && bundler.params.LOADERS[index]) {
					var loader = bundler.params.LOADERS[index];
					try {
						return await loader.load(resource, paramsCopy, loader.args, recieved, meta, async (...args) => {
							return await callLoader(index + 1, resource, ...args);
						});
					} catch(e) {
						errors[resource] = e;
					}
				}
				if (!recieved) {
					return bundler.load(resource, params);
				}
				return recieved;
			};
			return await callLoader(0, resource);
		};
		// --------------------------------
		var resources = Fs.readdirSync(bundler.baseDir);
		var readShift = async () => {
			var resourceName;
			if (!(resourceName = resources.shift())) {
				return;
			}
			let resource = Path.join(bundler.baseDir, resourceName);
			var basename = resourceName;
			if (Fs.statSync(resource).isDirectory()) {
				if (!(bundler.params.IGNORE_FOLDERS_BY_PREFIX || []).filter(prfx => resourceName.substr(0, prfx.length) === prfx).length) {
					var _params = {...bundler.params};
					_params.indentation ++;
					if (('SHOW_OUTLINE_NUMBERING' in bundler.params) && !bundler.params.SHOW_OUTLINE_NUMBERING && _isNumeric(_before(basename, '-'))) {
						basename = _after(basename, '-');
					}
					bundler.outline[basename] = await Bundler.readdir(resource, _params);
				}
			} else {
				var paramsCopy = {...bundler.params}, errors = {}, meta = {};
				if (!bundler.params.loadStart || bundler.params.loadStart(resource, paramsCopy) !== false) {
					var content = await load(resource, paramsCopy, errors, meta);
					if (bundler.params.loadEnd) {
						bundler.params.loadEnd(resource, paramsCopy, content, errors, meta);
					}
					basename = _beforeLast(basename, '.').toLowerCase();
					bundler.outline[basename] = {
						content,
						errors,
						meta,
					};
				}
			}
			await readShift();
		};
		await readShift();

		return bundler;
	}
		
	/**
	 * A Bundler instance.
	 *
	 * @param string		baseDir
	 * @param object		params
	 *
	 * @return void
	 */
	constructor(baseDir, params = {}) {
		if (!baseDir.endsWith('/')) {
			baseDir += '/';
		}
		this.baseDir = baseDir;
		this.params = params;
		this.params.ASSETS_PUBLIC_BASE = this.params.ASSETS_PUBLIC_BASE || '/';
		this.params.indentation = this.params.indentation || 0;
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
			// --------------
			var parts = Lexer.split(tag, '>', {limit: 1, blocks:[]});
			var isSelfClosingTag = parts[0].trim().endsWith('/');
			return comment + (isSelfClosingTag ? _beforeLast(parts[0], '/') : parts[0]) + ' ' + attributeName + '="' + attributeValue + '"' + (isSelfClosingTag ? ' /' : '') +  '>' + parts[1];
		};
		// -----------------------------------------
		this.outline = {};
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
const getPublicFilename = (filename, indentation) => {
	return filename.replace(/\\/g, '/').split('/').slice(- (indentation + 1)).join('/');
};
