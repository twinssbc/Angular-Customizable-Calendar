# Angular-Customizable-Calendar component

A customizable Angular calendar component

# Demo
https://twinssbc.github.io/Angular-Customizable-Calendar-Demo/

# Dependency
version 0.1.x is built based on Angular 7.1

# Usage

Install: `npm install angular-customizable-calendar --save`

Import the angular-customizable-calendar module:

``` typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgCalendarModule  } from 'angular-customizable-calendar/calendar';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgCalendarModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

Add the directive in the html page

``` html
    <calendar [eventSource]="eventSource"
        [calendarMode]="calendar.mode"
        [currentDate]="calendar.currentDate"
        (onCurrentDateChanged)="onCurrentDateChanged($event)"
        (onRangeChanged)="reloadSource(startTime, endTime)"
        (onEventSelected)="onEventSelected($event)"
        (onTitleChanged)="onViewTitleChanged($event)"
        (onTimeSelected)="onTimeSelected($event)"
        step="30">
        
    </calendar>
```

# Options

* formatDay    
The format of the date displayed in the month view.    
Default value: 'dd'
* formatDayHeader    
The format of the header displayed in the month view.    
Default value: 'EEE'
* formatDayTitle    
The format of the title displayed in the day view.    
Default value: 'MMMM dd, yyyy'
* formatWeekTitle    
The format of the title displayed in the week view.    
Default value: 'MMMM yyyy, \'Week\' w'
* formatMonthTitle    
The format of the title displayed in the month view.    
Default value: 'MMMM yyyy'
* formatWeekViewDayHeader    
The format of the header displayed in the week view.    
Default value: 'EEE d'
* formatHourColumn    
The format of the hour column displayed in the week and day view.    
Default value: 'ha'
* calendarMode    
The initial mode of the calendar.    
Default value: 'month'
* showEventDetail    
If set to true, when selecting the date in the month view, the events happened on that day will be shown below.    
Default value: true
* startingDayMonth    
Control month view starting from which day.    
Default value: 0
* startingDayWeek    
Control week view starting from which day.     
Default value: 0
* allDayLabel    
The text displayed in the allDay column header.    
Default value: 'all day'
* noEventsLabel    
The text displayed when there’s no event on the selected date in month view.    
Default value: 'No Events'
* eventSource    
The data source of the calendar, when the eventSource is set, the view will be updated accordingly.    
Default value: null    
The format of the eventSource is described in the EventSource section
* queryMode    
If queryMode is set to 'local', when the range or mode is changed, the calendar will use the already bound eventSource to update the view    
If queryMode is set to 'remote', when the range or mode is changed, the calendar will trigger a callback function rangeChanged.    
Users will need to implement their custom loading data logic in this function, and fill it into the eventSource. The eventSource is watched, so the view will be updated once the eventSource is changed.    
Default value: 'local'
* step    
It is used to display the event using more accurate time interval in weekview and dayview. For example, if set to 30, then the event will only occupy half of the row height (If timeInterval option uses default value).   The unit is minute. It can be set to 15 or 30.    
Default value: 60
``` html
        <calendar ... [step]="30"></calendar>
```

* timeInterval    
It is used to display the rows using more accurate time interval in weekview and dayview. For example, if set to 30, then the time interval between each row is 30 mins.  
The unit is minute. It should be the factor or multiple of 60, which means 60%timeInterval=0 or timeInterval%60=0.  
Default value: 60
``` html
        <calendar ... [timeInterval]="30"></calendar>
```

* autoSelect  
If set to true, the current calendar date will be auto selected when calendar is loaded or swiped in the month and week view.  
Default value: true
* locale  
The locale used to display text in the calendar.  
Default value: undefined (which means the local language)
``` html
    <calendar ... [locale]="calendar.locale"></calendar>
```
``` json
    calendar = {
        locale: 'en-GB'
    };
```
* markDisabled    
The callback function used to determine if the time should be marked as disabled.    
``` html
    <calendar ... [markDisabled]="markDisabled"></calendar>
```
``` typescript
    markDisabled = (date: Date) => {
        var current = new Date();
        return date < current;
    }
```
* dateFormatter    
The custom date formatter to transform date to text.    
If the custom date formatter is not set, the default Angular DatePipe is used.  
The format method in dateFormatter is optional, if omitted, the default Angular DatePipe is used.
``` html
    <calendar ... [dateFormatter]="calendar.dateFormatter"></calendar>
```
``` typescript
    calendar = {
        dateFormatter: {
            formatMonthViewDay: function(date:Date) {
                return date.getDate().toString();
            },
            formatMonthViewDayHeader: function(date:Date) {
                return 'testMDH';
            },
            formatMonthViewTitle: function(date:Date) {
                return 'testMT';
            },
            formatWeekViewDayHeader: function(date:Date) {
                return 'testWDH';
            },
            formatWeekViewTitle: function(date:Date) {
                return 'testWT';
            },
            formatWeekViewHourColumn: function(date:Date) {
                return 'testWH';
            },
            formatDayViewHourColumn: function(date:Date) {
                return 'testDH';
            },
            formatDayViewTitle: function(date:Date) {
                return 'testDT';
            }
        }
    };        
```

* startHour  
Limit the weekview and dayview starts from which hour (0-23).  
Default value: 0
``` html
    <calendar ... startHour="9"></calendar>
```

* endHour  
Limit the weekview and dayview ends until which hour (1-24).  
Default value: 24
``` html
    <calendar ... endHour="19"></calendar>
```

* onCurrentDateChanged  
The callback function triggered when the date that is currently viewed changes.
``` html
    <calendar ... (onCurrentDateChanged)="onCurrentDateChanged($event)"></calendar>
```
``` typescript
    onCurrentChanged = (ev: Date) => {
        console.log('Currently viewed date: ' + ev);
    };
```
* onRangeChanged    
The callback function triggered when the range or mode is changed if the queryMode is set to 'remote'.    
The ev parameter contains two fields, startTime and endTime.
``` html
    <calendar ... (onRangeChanged)="onRangeChanged($event)"></calendar>
```
``` typescript
    onRangeChanged = (ev: { startTime: Date, endTime: Date }) => {
        Events.query(ev, (events) => {
            this.eventSource = events;
        });
    };
```
* onEventSelected    
The callback function triggered when an event is clicked.
``` html
    <calendar ... (onEventSelected)="onEventSelected($event)"></calendar>
```
``` typescript
    onEventSelected = (event) => {
        console.log(event.title);
    };
```
* onTimeSelected    
The callback function triggered when a date is selected in the monthview.    
The ev parameter contains two fields, selectedTime and events, if there's no event at the selected time, the events field will be either undefined or empty array.
``` html
    <calendar ... (onTimeSelected)="onTimeSelected($event)"></calendar>
```
``` typescript
    onTimeSelected = (ev: { selectedTime: Date, events: any[] }) => {
        console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' + (ev.events !== undefined && ev.events.length !== 0));
    };
```
* onTitleChanged    
The callback function triggered when the view title is changed
``` html
    <calendar ... (onTitleChanged)="onViewTitleChanged($event)"></calendar>
```
``` typescript
    onViewTitleChanged = (title: string) => {
        this.viewTitle = title;
    };
```
# View Customization Option
There are two ways to customize the look and feel. If you just want to simply change the color or size of certain element, you could override the styles of the predefined css classes. **CSS Customization** section lists some important css classes. If you need to change the layout of certain element, you could refer to the **Template Customization** part.

## CSS Customization  

* monthview-primary-with-event  
The date that is in current month and having events

* monthview-secondary-with-event  
The date that is in previous/next month and having events

* monthview-selected  
The selected date

* monthview-current  
The current date

* monthview-disabled  
The disabled date

* weekview-with-event  
The date having all day events, applied to the day header in week view

* week-view-current  
The current date, applied to the day header in week view

* weekview-selected  
The selected date, applied to the day header in week view

* weekview-allday-label  
Applied to the all day label in week view

* dayview-allday-label  
Applied to the all day label in day view

* calendar-hour-column  
Applied to the hour column in both weekview and day view

* weekview-normal-event-container  
Applied to the normal event section in weekview, you could override the default height

* dayview-normal-event-container  
Applied to the normal event section in dayview, you could override the default height

## Template Customization  

Note: For any css class appear in the customized template, you need to specify the styles by yourself. The styles defined in the calendar component won’t be applied because of the view encapsulation. You could refer to calendar.ts to get the definition of context types.   

* monthviewDisplayEventTemplate    
Type: TemplateRef\<IMonthViewDisplayEventTemplateContext\>    
The template provides customized view for event displayed in the active monthview
``` html
    <ng-template #template let-view="view" let-row="row" let-col="col">
        {{view.dates[row*7+col].label}}
    </ng-template>

    <calendar ... [monthviewDisplayEventTemplate]="template"></calendar>
```
* monthviewEventDetailTemplate  
Type: TemplateRef\<IMonthViewEventDetailTemplateContext\>    
The template provides customized view for event detail section in the monthview
``` html
    <ng-template #template let-showEventDetail="showEventDetail" let-selectedDate="selectedDate" let-noEventsLabel="noEventsLabel">
    ... 
    </ng-template>

    <calendar ... [monthviewEventDetailTemplate]="template"></calendar>
```
* weekviewHeaderTemplate  
Type: TemplateRef\<IDisplayWeekViewHeader\>     
The template provides customized view for day header in the weekview 
``` html 
    <ng-template #template let-viewDate="viewDate"> 
        <div class="custom-day-header"> {{ viewDate.dayHeader }} </div> 
    </ng-template> 
 
    <calendar ... [weekviewHeaderTemplate]="template"></calendar>
```
* weekviewAllDayEventTemplate    
Type: TemplateRef\<IDisplayAllDayEvent\>    
The template provides customized view for all day event in the weekview
``` html
    <ng-template #template let-displayEvent="displayEvent">
        <div class="calendar-event-inner">{{displayEvent.event.title}}</div>
    </ng-template>

    <calendar ... [weekviewAllDayEventTemplate]="template"></calendar>
```
* weekviewNormalEventTemplate    
Type: TemplateRef\<IDisplayEvent\>    
The template provides customized view for normal event in the weekview

``` html
    <ng-template #template let-displayEvent="displayEvent">
        <div class="calendar-event-inner">{{displayEvent.event.title}}</div>
    </ng-template>

    <calendar ... [weekviewNormalEventTemplate]="template"></calendar>
```

* dayviewAllDayEventTemplate  
Type: TemplateRef\<IDisplayAllDayEvent\>    
The template provides customized view for all day event in the dayview
``` html
    <ng-template #template let-displayEvent="displayEvent">
        <div class="calendar-event-inner">{{displayEvent.event.title}}</div>
    </ng-template>

    <calendar ... [dayviewAllDayEventTemplate]="template"></calendar>
```

* dayviewNormalEventTemplate  
Type: TemplateRef\<IDisplayEvent\>    
The template provides customized view for normal event in the dayview

``` html
    <ng-template #template let-displayEvent="displayEvent">
        <div class="calendar-event-inner">{{displayEvent.event.title}}</div>
    </ng-template>

    <calendar ... [dayviewNormalEventTemplate]="template"></calendar>
```

* weekviewAllDayEventSectionTemplate  
Type: TemplateRef\<IWeekViewAllDayEventSectionTemplateContext\>    
The template provides customized view for all day event section (table part) in the weekview

``` html
        <ng-template #template let-day="day" let-eventTemplate="eventTemplate">
            <div [ngClass]="{'calendar-event-wrap': day.events}" *ngIf="day.events"
                 [ngStyle]="{height: 25*day.events.length+'px'}">
                <div *ngFor="let displayEvent of day.events" class="calendar-event" tappable
                     (click)="onEventSelected(displayEvent.event)"
                     [ngStyle]="{top: 25*displayEvent.position+'px', width: 100*(displayEvent.endIndex-displayEvent.startIndex)+'%', height: '25px'}">
                    <ng-template [ngTemplateOutlet]="eventTemplate"
                                 [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                    </ng-template>
                </div>
            </div>
        </ng-template>

        <calendar ... [weekviewAllDayEventSectionTemplate]="template"></calendar>
```

* weekviewNormalEventSectionTemplate  
Type: TemplateRef\<IWeekViewNormalEventSectionTemplateContext\>    
The template provides customized view for normal event section (table part) in the weekview

``` html
        <ng-template #template let-tm="tm" let-hourParts="hourParts" let-eventTemplate="eventTemplate">
            <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                <div *ngFor="let displayEvent of tm.events" class="calendar-event" tappable
                     (click)="onEventSelected(displayEvent.event)"
                     [ngStyle]="{top: (37*displayEvent.startOffset/hourParts)+'px',left: 100/displayEvent.overlapNumber*displayEvent.position+'%', width: 100/displayEvent.overlapNumber+'%', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+'px'}">
                    <ng-template [ngTemplateOutlet]="eventTemplate"
                                 [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                    </ng-template>
                </div>
            </div>
        </ng-template>

        <calendar ... [weekviewNormalEventSectionTemplate]="template"></calendar>
```

* dayviewAllDayEventSectionTemplate  
Type: TemplateRef\<IDayViewAllDayEventSectionTemplateContext\>    
The template provides customized view for all day event section (table part) in the dayview

``` html
        <ng-template #template let-allDayEvents="allDayEvents" let-eventTemplate="eventTemplate">
            <div *ngFor="let displayEvent of allDayEvents; let eventIndex=index"
                 class="calendar-event" tappable
                 (click)="onEventSelected(displayEvent.event)"
                 [ngStyle]="{top: 25*eventIndex+'px',width: '100%',height:'25px'}">
                <ng-template [ngTemplateOutlet]="eventTemplate"
                             [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                </ng-template>
            </div>
        </ng-template>

        <calendar ... [dayviewAllDayEventSectionTemplate]="template"></calendar>
```

* dayviewNormalEventSectionTemplate  
Type: TemplateRef\<IDayViewNormalEventSectionTemplateContext\>    
The template provides customized view for normal event section (table part) in the dayview

``` html
        <ng-template #template let-tm="tm" let-hourParts="hourParts" let-eventTemplate="eventTemplate">
            <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                <div *ngFor="let displayEvent of tm.events" class="calendar-event" tappable
                     (click)="onEventSelected(displayEvent.event)"
                     [ngStyle]="{top: (37*displayEvent.startOffset/hourParts)+'px',left: 100/displayEvent.overlapNumber*displayEvent.position+'%', width: 100/displayEvent.overlapNumber+'%', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+'px'}">
                    <ng-template [ngTemplateOutlet]="eventTemplate"
                                 [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                    </ng-template>
                </div>
            </div>
        </ng-template>

        <calendar ... [dayviewNormalEventSectionTemplate]="template"></calendar>
```

# EventSource

EventSource is an array of event object which contains at least below fields:

* title  
* startTime    
If allDay is set to true, the startTime has to be as a UTC date which time is set to 0:00 AM, because in an allDay event, only the date is considered, the exact time or timezone doesn't matter.    
For example, if an allDay event starting from 2014-05-09, then startTime is

``` javascript
    var startTime = new Date(Date.UTC(2014, 4, 8));
```

* endTime    
If allDay is set to true, the startTime has to be as a UTC date which time is set to 0:00 AM, because in an allDay event, only the date is considered, the exact time or timezone doesn't matter.    
For example, if an allDay event ending to 2014-05-10, then endTime is
``` javascript
    var endTime = new Date(Date.UTC(2014, 4, 9));
```
* allDay    
Indicates the event is allDay event or regular event

**Note** The calendar only watches for the eventSource reference for performance consideration. That means only you manually reassign the eventSource value, the calendar gets notified, and this is usually fit to the scenario when the range is changed, you load a new data set from the backend. In case you want to manually insert/remove/update the element in the eventSource array, you can call instance method ‘loadEvents’ event to notify the calendar manually.

# Instance Methods
* loadEvents  
When this method is called, the calendar will be forced to reload the events in the eventSource array. This is only necessary when you directly modify the element in the eventSource array.

``` typescript
import { CalendarComponent } from "angular-customizable-calendar/calendar";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    @ViewChild(CalendarComponent) myCalendar:CalendarComponent;
    eventSource;
    …
    loadEvents: function() {
        this.eventSource.push({
            title: 'test',
            startTime: startTime,
            endTime: endTime,
            allDay: false
        });
        this.myCalendar.loadEvents();
    }
}
```

* previous  
Navigate the calendar to previous date range.

``` typescript
import { CalendarComponent } from "angular-customizable-calendar/calendar";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    @ViewChild(CalendarComponent) myCalendar:CalendarComponent;
    eventSource;
    …
    previous: function() {
        this.myCalendar.previous();
    }
}
```

* next  
Navigate the calendar to next date range.

``` typescript
import { CalendarComponent } from "angular-customizable-calendar/calendar";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    @ViewChild(CalendarComponent) myCalendar:CalendarComponent;
    eventSource;
    …
    next: function() {
        this.myCalendar.next();
    }
}
```

# Localization    
You could use *locale* option to achieve the localization.  
If locale option is not specified, the calendar will use the LOCALE_ID set at the module level.  
By default, the LOCALE_ID is **en-US**. You can override it in the module as below. If you pass **undefined**, the LOCALE_ID will be detected using the browser language setting. But using explicit value is recommended, as browser has different level of localization support.    
Note that the event detail section in the month view doesn't support *locale* option, only LOCALE_ID takes effect. This is because it uses DatePipe in html directly. You could easily leverage customized event detail template to switch to other locale. 

``` typescript
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeZh from '@angular/common/locales/zh';
registerLocaleData(localeZh);

@NgModule({
    …
    providers: [
        { provide: LOCALE_ID, useValue: 'zh-CN' }
    ]
})
```

If you want to change the locale dynamically, you should use *locale* option instead of LOCALE_ID.

# Performance Tuning    
If you don’t need localization on certain parts, you can use the custom dateFormatter to override the date transform method. For example, the date in month view usually doesn’t require localization, you could use below code to just display the date part. If the month view day header doesn’t need to include the date, you could also use a string array containing static labels to save the date calculation.

``` html
<calendar ... [dateFormatter]="calendar.dateFormatter"></calendar>
```
``` typescript
calendar = {
    dateFormatter: {
        formatMonthViewDay: function(date:Date) {
            return date.getDate().toString();
        }            
    }
};
```


# Common Questions
* Error: Cannot read property 'getFullYear' of undefined  
Answer: If you bind currentDate like this: [currentDate]="calendar.currentDate". You need to assign calendar.currentDate a valid Date object.

* How to switch the calendar to previous/next month programmatically?  
Answer: You can change currentDate to the date in previous/next month or call the instance method previous()/next().

* Error: Cannot read property 'dayHeaders' of undefined  
Answer: Take a look at the Localization section.
