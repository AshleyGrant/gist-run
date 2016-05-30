import ace from 'ace';
import {
  inject,
  inlineView,
  bindable,
  bindingMode
} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DOM} from 'aurelia-pal';
import {ThemePreference} from '../themes/theme-preference';

// // retrieve ace's base path from the System config
// let base = System.normalizeSync('ace');
// base = base.substr(0, base.length - 3);
// ace.config.set('basePath', base);


@inject(Element, EventAggregator, ThemePreference)
@inlineView('<template></template>')
@bindable({ name: 'theme'})
@bindable({ name: 'mode', defaultValue: 'javascript' })
@bindable({ name: 'value', defaultValue: '', defaultBindingMode: bindingMode.twoWay })
export class AceEditor {
  constructor(element, ea, themePreference) {
    this.element = element;
    this.ea = ea;
    this.themePreference = themePreference;

    const preferredTheme = this.themePreference.loadThemePreference();

    if (preferredTheme) {
      this.theme = preferredTheme.aceTheme;
    }
    element.focus = ::this.focus;
  }

  themeChanged() {
    if (this.editor) {
      this.editor.setTheme(`ace/theme/${this.theme}`);
    }
  }

  modeChanged() {
    if (this.editor) {
      this.editor.getSession().setMode(`ace/mode/${this.mode}`);
    }
  }

  resetUndo() {
    this.editor.getSession().setUndoManager(new ace.UndoManager());
  }

  valueChanged() {
    if (this.editor && this.editor.getValue() !== this.value) {
      this.editor.setValue(this.value, -1);
      this.resetUndo();
    }
  }

  resize() {
    if (this.editor) {
      this.editor.resize();
    }
  }

  attached() {
    this.editor = ace.edit(this.element);

    // increase horizontal padding
    this.editor.renderer.setPadding(5);

    // avoid warning message in console
    this.editor.$blockScrolling = Infinity;

    // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
    this.editor.setOptions({
      showPrintMargin: false,
      showGutter: false,
      cursorStyle: 'slim',
      useSoftTabs: true,
      tabSize: 2,
      displayIndentGuides: false,
      showInvisibles: false
    });

    // set initial values.
    this.themeChanged();
    this.modeChanged();
    this.valueChanged();

    // when propagate editor changes to the value bindable.
    this.editor.getSession().on('change', e => {
      this.value = this.editor.getValue();
      let changeEvent = DOM.createCustomEvent('change', { bubbles: true, detail: this.value });
      this.element.dispatchEvent(changeEvent);
    });

    this.themeChangedSubscription = this.ea.subscribe('theme-changed', theme => {
      this.theme = theme.aceTheme;
      this.themePreference.saveThemePreference(theme);
    });
  }

  detached() {
    this.themeChangedSubscription.dispose();
    this.editor.getSession().off('change');
    this.editor.destroy();
    this.editor = null;
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }
}
