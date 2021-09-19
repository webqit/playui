
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
const CollectionWidget = class extends WebQit.SubscriptElement(WidgetElements._Collection(HTMLFieldSetElement)) {};
const MultipleWidget = class extends WebQit.SubscriptElement(WidgetElements._Multiple(HTMLFieldSetElement)) {};
const Multiple2Widget = class extends WebQit.SubscriptElement(WidgetElements._Multiple2(HTMLFieldSetElement)) {};
const EnumWidget = class extends WebQit.SubscriptElement(WidgetElements._Enum(HTMLLabelElement)) {};
const Enum2Widget = class extends WebQit.SubscriptElement(WidgetElements._Enum2(HTMLLabelElement)) {};
const FileWidget = class extends WebQit.SubscriptElement(WidgetElements._File(HTMLLabelElement)) {};
const EditorWidget = class extends WebQit.SubscriptElement(WidgetElements._Editor(HTMLLabelElement)) {};
const TextWidget = class extends WebQit.SubscriptElement(WidgetElements._Text(HTMLLabelElement)) {};
const NumberWidget = class extends WebQit.SubscriptElement(WidgetElements._Number(HTMLLabelElement)) {};
const StateWidget = class extends WebQit.SubscriptElement(WidgetElements._State(HTMLLabelElement)) {};
customElements.define('playui-form-widget', FormWidget, { extends: 'form' });
customElements.define('playui-collection-widget', CollectionWidget, { extends: 'fieldset' });
customElements.define('playui-multiple-widget', MultipleWidget, { extends: 'fieldset' });
customElements.define('playui-multiple2-widget', Multiple2Widget, { extends: 'fieldset' });
customElements.define('playui-enum-widget', EnumWidget, { extends: 'label' });
customElements.define('playui-enum2-widget', Enum2Widget, { extends: 'label' });
customElements.define('playui-file-widget', FileWidget, { extends: 'label' });
customElements.define('playui-editor-widget', EditorWidget, { extends: 'label' });
customElements.define('playui-text-widget', TextWidget, { extends: 'label' });
customElements.define('playui-number-widget', NumberWidget, { extends: 'label' });
customElements.define('playui-state-widget', StateWidget, { extends: 'label' });
