
/**
 * @imports
 */
import Fs from 'fs';
import Path from 'path';
import { _isObject, _isNumeric, _isString } from '@webqit/util/js/index.js';
import { _before, _beforeLast, _after } from '@webqit/util/str/index.js';

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
				var bundler = await this.readdir(from[name], _params);
				bundles[name] = bundler.output(_to, _params.ASSETS_STORAGE_BASE);
				await readShift();
			};
			await readShift();

			return bundles;
		}

		return (await this.readdir(from, params)).output(to, params.ASSETS_STORAGE_BASE);
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
		const bundler = new this(basePath, params);
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
					var _params = { ...bundler.params };
					_params.indentation ++;
					if (('SHOW_OUTLINE_NUMBERING' in bundler.params) && !bundler.params.SHOW_OUTLINE_NUMBERING // IS FALSE?
					&& _isNumeric(_before(basename, '-'))) {
						basename = _after(basename, '-');
					}
					bundler.outline[basename] = await this.readdir(resource, _params);
				}
			} else {
				var paramsCopy = { ...bundler.params }, errors = {}, meta = {};
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
		this.outline = {};
	}
}