
/**
 * imports
 */
import Path from 'path';
import { _merge } from '@webqit/util/obj/index.js';
import { initialGetIndex } from '@webqit/backpack/src/cli/Promptx.js';
import * as DotJson from '@webqit/backpack/src/dotfiles/DotJson.js';

/**
 * Reads BUNDLING from file.
 * 
 * @param object    flags
 * @param object    params
 * 
 * @return object
 */
export async function read(flags = {}, params = {}) {
    const config = DotJson.read(Path.join(params.ROOT || '', './.webqit/playui-cli/config/bundler.json'));
    return _merge({
        ENTRY_DIR: './',
        OUTPUT_FILE: './bundle.html',
        ASSETS_STORAGE_BASE: './',
        ASSETS_PUBLIC_BASE: '/',
        MAX_DATA_URL_SIZE: 1024,
        LOADERS: [],
        // ---------
        // Advanced
        // ---------
        IGNORE_FOLDERS_BY_PREFIX: ['.'],
        CREATE_OUTLINE_FILE: 'create',
        // ---------
        // OOHTML-related
        // ---------
        MODULE_EXT: '',
        MODULE_ID_ATTR: 'name',
        EXPORT_MODE: 'attribute',
        EXPORT_GROUP_ATTR: 'exportgroup',
        EXPORT_ELEMENT: 'html-export',
        EXPORT_ID_ATTR: 'export',
    }, config);
};

/**
 * Writes BUNDLING to file.
 * 
 * @param object    data
 * @param object    flags
 * @param object    params
 * 
 * @return void
 */
export async function write(data, flags = {}, params = {}) {
    DotJson.write(data, Path.join(params.ROOT || '', './.webqit/playui-cli/config/bundler.json'));
};

/**
 * Configures BUNDLING.
 * 
 * @param object    config
 * @param object    choices
 * @param object    params
 * 
 * @return Array
 */
export async function questions(config, choices = {}, params = {}) {

    // Params
    const DATA = config;

    // Choices hash...
    const CHOICES = _merge({
        export_mode: [
            {value: 'attribute', title: 'Use the "exportgroup" attribute'},
            {value: 'element', title: 'Use the "export" element'},
        ],
        create_outline_file: [
            {value: '', title: 'No outline'},
            {value: 'create', title: 'Create'},
            {value: 'create_merge', title: 'Create and merge'},
        ],
    }, choices);

    // Questions
    return [
        {
            name: 'ENTRY_DIR',
            type: 'text',
            message: '[ENTRY_DIR]: Enter the entry directory (absolute or relative to Current Working Directory.)',
            initial: DATA.ENTRY_DIR,
            validation: ['important'],
        },
        {
            name: 'OUTPUT_FILE',
            type: 'text',
            message: '[OUTPUT_FILE]: Enter the output file name (absolute or relative to ENTRY_DIR.)',
            initial: DATA.OUTPUT_FILE,
            validation: ['important'],
        },
        {
            name: 'ASSETS_STORAGE_BASE',
            type: 'text',
            message: '[ASSETS_STORAGE_BASE]: Enter the storage base for assets (absolute or relative to ENTRY_DIR.)',
            initial: DATA.ASSETS_STORAGE_BASE,
        },
        {
            name: 'ASSETS_PUBLIC_BASE',
            type: 'text',
            message: '[ASSETS_PUBLIC_BASE]: Enter the public base for assets',
            initial: DATA.ASSETS_PUBLIC_BASE,
        },
        {
            name: 'MAX_DATA_URL_SIZE',
            type: 'number',
            message: '[MAX_DATA_URL_SIZE]: Enter the data-URL threshold for media files',
            initial: DATA.MAX_DATA_URL_SIZE,
            validation: ['important'],
        },
        {
            name: 'LOADERS',
            type: 'recursive',
            initial: DATA.LOADERS,
            controls: {
                name: 'loader',
                message: '[LOADERS]: Configure loaders?',
            },
            questions: [
                {
                    name: 'name',
                    type: 'text',
                    message: '[name]: Enter loader name',
                    validation: ['important'],
                },
                {
                    name: 'args',
                    type: 'recursive',
                    controls: {
                        name: 'argument/flag',
                        message: '[args]: Enter loader arguments/flags',
                        combomode: true,
                    },
                    questions: [
                        {
                            name: 'name',
                            type: 'text',
                            message: '[name]: Enter argument/flag name',
                            validation: ['important'],
                        },
                        {
                            name: 'value',
                            type: 'text',
                            message: '[value]: Enter argument/flag value',
                            validation: ['important'],
                        },
                    ]
                },
            ]
        },
        // ---------
        // Advanced
        // ---------
        {
            name: '__advanced',
            type: 'toggle',
            message: 'Show advanced options?',
            active: 'YES',
            inactive: 'NO',
            initial: DATA.__advanced,
        },
        {
            name: 'IGNORE_FOLDERS_BY_PREFIX',
            type: (prev, answers) => answers.__advanced ? 'list' : null,
            message: '[IGNORE_FOLDERS_BY_PREFIX]: List folders to ignore by prefix (comma-separated)',
            initial: (DATA.IGNORE_FOLDERS_BY_PREFIX || []).join(', '),
        },
        {
            name: 'CREATE_OUTLINE_FILE',
            type: (prev, answers) => answers.__advanced ? 'select' : null,
            message: '[CREATE_OUTLINE_FILE]: Choose whether to create an outline file',
            choices: CHOICES.create_outline_file,
            initial: initialGetIndex(CHOICES.create_outline_file, DATA.CREATE_OUTLINE_FILE),
        },
        // ---------
        // OOHTML-related
        // ---------
        {
            name: '__advanced_oohtml',
            type: 'toggle',
            message: 'Show OOHTML-related options?',
            active: 'YES',
            inactive: 'NO',
            initial: DATA.__advanced,
        },
        {
            name: 'MODULE_EXT',
            type: (prev, answers) => answers.__advanced_oohtml ? 'text' : null,
            message: '[MODULE_EXT]: Enter the "template" custom element name (e.g: html-module or leave empty)',
            initial: DATA.MODULE_EXT,
        },
        {
            name: 'MODULE_ID_ATTR',
            type: (prev, answers) => answers.__advanced_oohtml ? 'text' : null,
            message: '[MODULE_ID_ATTR]: Enter the template element\'s "name" attribute (e.g: name)',
            initial: DATA.MODULE_ID_ATTR,
            validation:['important'],
        },
        {
            name: 'EXPORT_MODE',
            type: (prev, answers) => answers.__advanced_oohtml ? 'select' : null,
            message: '[EXPORT_MODE]: Choose how to export snippets',
            choices: CHOICES.export_mode,
            initial: initialGetIndex(CHOICES.export_mode, DATA.EXPORT_MODE),
        },
        {
            name: 'EXPORT_GROUP_ATTR',
            type: (prev, answers) => answers.__advanced_oohtml && answers.EXPORT_MODE === 'attribute' ? 'text' : null,
            message: '[EXPORT_GROUP_ATTR]: Enter the "export group" attribute (e.g: exportgroup)',
            initial: DATA.EXPORT_GROUP_ATTR,
            validation: ['important'],
        },
        {
            name: 'EXPORT_ELEMENT',
            type: (prev, answers) => answers.__advanced_oohtml && answers.EXPORT_MODE === 'element' ? 'text' : null,
            message: '[EXPORT_ELEMENT]: Enter the "export" element (e.g: html-export)',
            initial: DATA.EXPORT_ELEMENT,
            validation: ['important'],
        },
        {
            name: 'EXPORT_ID_ATTR',
            type: (prev, answers) => answers.__advanced_oohtml && answers.EXPORT_MODE === 'element' ? 'text' : null,
            message: '[EXPORT_ID_ATTR]: Enter the export element\'s "name" attribute (e.g: name)',
            initial: DATA.EXPORT_ID_ATTR,
            validation: ['important'],
        },
    ];
};
