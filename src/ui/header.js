import {inject, bindable, TaskQueue} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {User} from '../github/user';
import {ThemePreference} from '../themes/theme-preference';
import {lightThemes, darkThemes} from '../themes/themes';

@inject(User, TaskQueue, EventAggregator, ThemePreference)
export class Header {
  @bindable import;
  @bindable new;
  @bindable theme;
  lightThemes = lightThemes;
  darkThemes = darkThemes;
  guard = true;

  constructor(user, taskQueue, ea, themePreference) {
    this.user = user;
    this.taskQueue = taskQueue;
    this.ea = ea;
    this.themePreference = themePreference;
  }

  attached() {
    const theme = this.themePreference.loadThemePreference();

    if (theme) {
      this.guard = true;
      this.theme = theme;
    }
    this.taskQueue.queueMicroTask(() => this.guard = false);
  }

  themeChanged(newValue) {
    if (!this.guard) {
      this.themePreference.saveThemePreference(newValue);
      this.ea.publish('theme-changed', newValue);
    }
  }
}
