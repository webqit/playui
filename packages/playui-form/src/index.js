
/**
 * @imports
 */
import * as WidgetElements from './playui-element-mixins.js';

/**
 * ---------------------------
 * @playui widgets
 * ---------------------------
 */

const FormWidget = class extends WebQit.SubscriptElement(WidgetElements._Collection(HTMLFormElement)) {};
customElements.define('playui-form-widget', FormWidget, { extends: 'form' });

const CollectionWidget = class extends WidgetElements._Collection(WebQit.SubscriptElement(HTMLFieldSetElement)) {};
const MultipleWidget = class extends WidgetElements._Multiple(WebQit.SubscriptElement(HTMLFieldSetElement)) {};
const Multiple2Widget = class extends WidgetElements._Multiple2(WebQit.SubscriptElement(HTMLFieldSetElement)) {};
const EnumWidget = class extends WidgetElements._Enum(WebQit.SubscriptElement(HTMLDivElement)) {};
const Enum2Widget = class extends WidgetElements._Enum2(WebQit.SubscriptElement(HTMLDivElement)) {};
const FileWidget = class extends WidgetElements._File(WebQit.SubscriptElement(HTMLDivElement)) {};
const EditorWidget = class extends WidgetElements._Editor(WebQit.SubscriptElement(HTMLDivElement)) {};
const TextWidget = class extends WidgetElements._Text(WebQit.SubscriptElement(HTMLDivElement)) {};
const NumberWidget = class extends WidgetElements._Number(WebQit.SubscriptElement(HTMLDivElement)) {};
const StateWidget = class extends WidgetElements._State(WebQit.SubscriptElement(HTMLDivElement)) {};
customElements.define('playui-collection-widget', CollectionWidget, { extends: 'fieldset' });
customElements.define('playui-multiple-widget', MultipleWidget, { extends: 'fieldset' });
customElements.define('playui-multiple2-widget', Multiple2Widget, { extends: 'fieldset' });
customElements.define('playui-enum-widget', EnumWidget, { extends: 'div' });
customElements.define('playui-enum2-widget', Enum2Widget, { extends: 'div' });
customElements.define('playui-file-widget', FileWidget, { extends: 'div' });
customElements.define('playui-editor-widget', EditorWidget, { extends: 'div' });
customElements.define('playui-text-widget', TextWidget, { extends: 'div' });
customElements.define('playui-number-widget', NumberWidget, { extends: 'div' });
customElements.define('playui-state-widget', StateWidget, { extends: 'div' });

const CollectionItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Collection(WebQit.SubscriptElement(HTMLFieldSetElement))) {};
const MultipleItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Multiple(WebQit.SubscriptElement(HTMLFieldSetElement))) {};
const Multiple2ItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Multiple2(WebQit.SubscriptElement(HTMLFieldSetElement))) {};
const EnumItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Enum(WebQit.SubscriptElement(HTMLDivElement))) {};
const Enum2ItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Enum2(WebQit.SubscriptElement(HTMLDivElement))) {};
const FileItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._File(WebQit.SubscriptElement(HTMLDivElement))) {};
const EditorItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Editor(WebQit.SubscriptElement(HTMLDivElement))) {};
const TextItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Text(WebQit.SubscriptElement(HTMLDivElement))) {};
const NumberItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._Number(WebQit.SubscriptElement(HTMLDivElement))) {};
const StateItemScopeWidget = class extends WidgetElements._ItemScope(WidgetElements._State(WebQit.SubscriptElement(HTMLDivElement))) {};
customElements.define('playui-collection-itemscope-widget', CollectionItemScopeWidget, { extends: 'fieldset' });
customElements.define('playui-multiple-itemscope-widget', MultipleItemScopeWidget, { extends: 'fieldset' });
customElements.define('playui-multiple2-itemscope-widget', Multiple2ItemScopeWidget, { extends: 'fieldset' });
customElements.define('playui-enum-itemscope-widget', EnumItemScopeWidget, { extends: 'div' });
customElements.define('playui-enum2-itemscope-widget', Enum2ItemScopeWidget, { extends: 'div' });
customElements.define('playui-file-itemscope-widget', FileItemScopeWidget, { extends: 'div' });
customElements.define('playui-editor-itemscope-widget', EditorItemScopeWidget, { extends: 'div' });
customElements.define('playui-text-itemscope-widget', TextItemScopeWidget, { extends: 'div' });
customElements.define('playui-number-itemscope-widget', NumberItemScopeWidget, { extends: 'div' });
customElements.define('playui-state-itemscope-widget', StateItemScopeWidget, { extends: 'div' });

const FilePreview = class extends WidgetElements._FilePreview(HTMLDivElement) {};
customElements.define('playui-file-preview', FilePreview, { extends: 'div' });
