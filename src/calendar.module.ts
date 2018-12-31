import { NgModule } from '@angular/core';
import { MonthViewComponent } from './monthview';
import { WeekViewComponent } from './weekview';
import { DayViewComponent } from './dayview';
import { CalendarComponent} from './calendar';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
    declarations: [
        MonthViewComponent, WeekViewComponent, DayViewComponent, CalendarComponent
    ],
    imports: [
        BrowserModule
    ],
    exports: [CalendarComponent],
    entryComponents: [CalendarComponent]
})
export class NgCalendarModule {}
