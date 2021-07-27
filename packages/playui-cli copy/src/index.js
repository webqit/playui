#!/usr/bin/env node

/**
 * imports
 */
import { _merge } from '@webqit/util/obj/index.js';
import Ui from '@webqit/backpack/src/cli/Ui.js';
import parseArgs from '@webqit/backpack/src/cli/parseArgs.js';
import { Promptx } from '@webqit/backpack/src/cli/Promptx.js';
import * as DotJson from '@webqit/backpack/src/dotfiles/DotJson.js';
import * as config from './config/index.js';
import * as cmd from './cmd/index.js';

// ------------------------------------------

const PKG = DotJson.read('./package.json');
const params = {
    ROOT: process.cwd(),
    PKG,
};

// ------------------------------------------

const commands = {
    config: 'Configure an Play UI CLI command.',
    bundle: cmd.bundler.desc.bundle,
};

// ------------------------------------------

const { command, keywords, flags, options, ellipsis } = parseArgs(process.argv);

// ------------------------------------------

console.log('');

(async function() {
    switch(command) {

        // --------------------------

        case 'bundle':
            cmd.bundler.bundle(Ui, flags, params);
        break;

        // --------------------------

        case 'config':
            
            // config
            var domain = Object.keys(keywords)[0];
            // ----------------
            if (!domain && ellipsis) {
                domain = await Promptx({
                    name: 'domain',
                    type: 'select',
                    choices: Object.keys(config).map(c => ({value: c})),
                    message: 'Please select a configuration domain',
                }).then(d => d.domain);
            }
            if (!domain || !config[domain]) {
                Ui.log(Ui.f`Please add a configuration domain to the ${command} command. For options, use the ellipsis ${'...'}`);
                return;
            }
            // ----------------
            const data = await config[domain].read(flags, params);
            Promptx(await config[domain].questions(data, {}, params)).then(async _data => {
                await config[domain].write(_merge(data, _data), flags, params);
            });

        break;

        case 'help':
        default:
            Ui.title(`Play UI CLI HELP`);
            Ui.log('');
            Ui.log(Ui.f`Say ${'playui'} <${'command'}>`);
            Ui.log('');
            Ui.log(Ui.f`Where <${'command'}> is one of:`);
            Ui.log(Ui.f`${commands}`);
            Ui.log('');
            Ui.log(Ui.f`You may also refer to the Play UI CLI DOCS at ${'https://webqit.io/tooling/play-ui/docs/cli'}`);
            Ui.log('');
    }    
})();
