import {DatePipe} from '@angular/common';
import {
    Component,
    OnInit,
    OnChanges,
    HostBinding,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    ViewEncapsulation,
    TemplateRef,
    ElementRef
} from '@angular/core';
import {Subscription} from 'rxjs';

import {
    ICalendarComponent,
    IDisplayEvent,
    IEvent,
    ITimeSelected,
    IRange,
    IWeekView,
    IWeekViewRow,
    IWeekViewDateRow,
    CalendarMode,
    IDateFormatter,
    IDisplayWeekViewHeader
} from './calendar';
import {CalendarService} from './calendar.service';
import {
    IDisplayAllDayEvent,
    IWeekViewAllDayEventSectionTemplateContext,
    IWeekViewNormalEventSectionTemplateContext
} from './calendar';

@Component({
    selector: 'weekview',
    template: `
        <table class="table table-bordered table-fixed weekview-header">
            <thead>
            <tr>
                <th class="calendar-hour-column"></th>
                <th class="weekview-header text-center" *ngFor="let date of view.dates"
                    [ngClass]="getHighlightClass(date)"
                    (click)="daySelected(date)">
                    <ng-template [ngTemplateOutlet]="weekviewHeaderTemplate"
                                 [ngTemplateOutletContext]="{viewDate:date}">
                    </ng-template>
                </th>
                <th *ngIf="gutterWidth>0" class="gutter-column" [ngStyle]="{width: gutterWidth+'px'}"></th>
            </tr>
            </thead>
        </table>
        <div class="weekview-allday-table">
            <div class="weekview-allday-label">{{allDayLabel}}</div>
            <div class="weekview-allday-content-wrapper">
                <table class="table table-fixed weekview-allday-content-table">
                    <tbody>
                    <tr>
                        <td *ngFor="let day of view.dates" class="calendar-cell">
                            <ng-template [ngTemplateOutlet]="weekviewAllDayEventSectionTemplate"
                                         [ngTemplateOutletContext]="{day:day, eventTemplate:weekviewAllDayEventTemplate}">
                            </ng-template>
                        </td>
                        <td *ngIf="allDayEventGutterWidth>0" class="gutter-column"
                            [ngStyle]="{width: allDayEventGutterWidth+'px'}"></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="weekview-normal-event-container">
            <table class="table table-bordered table-fixed weekview-normal-event-table">
                <tbody>
                <tr *ngFor="let row of view.rows; let i = index">
                    <td class="calendar-hour-column text-center">
                        {{hourColumnLabels[i]}}
                    </td>
                    <td *ngFor="let tm of row" class="calendar-cell" tappable (click)="select(tm.time, tm.events)">
                        <ng-template [ngTemplateOutlet]="weekviewNormalEventSectionTemplate"
                                     [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:weekviewNormalEventTemplate}">
                        </ng-template>
                    </td>
                    <td *ngIf="normalGutterWidth>0" class="gutter-column"
                        [ngStyle]="{width: normalGutterWidth+'px'}"></td>
                </tr>
                </tbody>
            </table>
        </div>
    `,
    styles: [`
        .table-fixed {
            table-layout: fixed;
        }

        * {
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }

        .weekview-normal-event-container {
            overflow-y: auto;
            overflow-x: hidden;
            height: 500px;
        }

        .table {
            width: 100%;
            max-width: 100%;
            background-color: transparent;
            border-collapse: collapse;
            border-spacing: 0;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }

        .table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td,
        .table > tbody > tr > td, .table > tfoot > tr > td {
            padding: 8px;
            line-height: 20px;
            vertical-align: top;
        }

        .table > thead > tr > th {
            vertical-align: bottom;
            border-bottom: 2px solid #ddd;
        }

        .table > thead:first-child > tr:first-child > th, .table > thead:first-child > tr:first-child > td {
            border-top: 0
        }

        .table > tbody + tbody {
            border-top: 2px solid #ddd;
        }

        .table-bordered {
            border: 1px solid #ddd;
        }

        .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th,
        .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td {
            border: 1px solid #ddd;
        }

        .table-bordered > thead > tr > th, .table-bordered > thead > tr > td {
            border-bottom-width: 2px;
        }

        .table-striped > tbody > tr:nth-child(odd) > td, .table-striped > tbody > tr:nth-child(odd) > th {
            background-color: #f9f9f9
        }

        .gutter-column {
            padding-left: 0 !important;
            padding-right: 0 !important;
        }

        .calendar-hour-column {
            width: 50px;
            white-space: nowrap;
        }

        .calendar-event-wrap {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .calendar-event {
            position: absolute;
            padding: 2px;
            cursor: pointer;
            z-index: 10000;
        }

        .calendar-cell {
            padding: 0 !important;
            height: 37px;
        }

        .weekview-allday-label {
            float: left;
            height: 100%;
            line-height: 50px;
            text-align: center;
            width: 50px;
            border-left: 1px solid #ddd;
        }

        .weekview-allday-content-wrapper {
            margin-left: 50px;
            overflow-x: hidden;
            overflow-y: auto;
            height: 51px;
        }

        .weekview-allday-content-table {
            min-height: 50px;
        }

        .weekview-allday-content-table td {
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }

        .weekview-header th {
            overflow: hidden;
            white-space: nowrap;
            font-size: 14px;
        }

        .weekview-allday-table {
            height: 50px;
            position: relative;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
        }

        .table > tbody > tr > td.calendar-hour-column {
            padding-left: 0;
            padding-right: 0;
            vertical-align: middle;
            text-align: center;
        }

        @media (max-width: 750px) {
            .weekview-allday-label, .calendar-hour-column {
                width: 31px;
                font-size: 12px;
            }

            .weekview-allday-label {
                padding-top: 4px;
            }

            .table > tbody > tr > td.calendar-hour-column {
                line-height: 12px;
            }

            .table > thead > tr > th.weekview-header {
                padding-left: 0;
                padding-right: 0;
                font-size: 12px;
            }

            .weekview-allday-label {
                line-height: 20px;
            }

            .weekview-allday-content-wrapper {
                margin-left: 31px;
            }
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class WeekViewComponent implements ICalendarComponent, OnInit, OnChanges {
    @HostBinding('class.weekview') class = true;

    @Input() weekviewHeaderTemplate: TemplateRef<IDisplayWeekViewHeader>;
    @Input() weekviewAllDayEventTemplate: TemplateRef<IDisplayAllDayEvent>;
    @Input() weekviewNormalEventTemplate: TemplateRef<IDisplayEvent>;
    @Input() weekviewAllDayEventSectionTemplate: TemplateRef<IWeekViewAllDayEventSectionTemplateContext>;
    @Input() weekviewNormalEventSectionTemplate: TemplateRef<IWeekViewNormalEventSectionTemplateContext>;

    @Input() formatWeekTitle: string;
    @Input() formatWeekViewDayHeader: string;
    @Input() formatHourColumn: string;
    @Input() startingDayWeek: number;
    @Input() allDayLabel: string;
    @Input() hourParts: number;
    @Input() eventSource: IEvent[];
    @Input() autoSelect = true;
    @Input() markDisabled: (date: Date) => boolean;
    @Input() locale: string;
    @Input() dateFormatter: IDateFormatter;
    @Input() startHour: number;
    @Input() endHour: number;
    @Input() hourSegments: number;

    @Output() onRangeChanged = new EventEmitter<IRange>();
    @Output() onEventSelected = new EventEmitter<IEvent>();
    @Output() onTimeSelected = new EventEmitter<ITimeSelected>();
    @Output() onTitleChanged = new EventEmitter<string>(true);

    public view: IWeekView;
    public currentViewIndex = 0;
    public range: IRange;
    public direction = 0;
    public mode: CalendarMode = 'week';

    private inited = false;
    private currentDateChangedFromParentSubscription: Subscription;
    private eventSourceChangedSubscription: Subscription;
    private hourColumnLabels: string[];
    private formatDayHeader: (date: Date) => string;
    private formatTitle: (date: Date) => string;
    private formatHourColumnLabel: (date: Date) => string;
    private hourRange: number;

    public gutterWidth: number;
    public allDayEventGutterWidth: number;
    private normalGutterWidth: number;

    constructor(private calendarService: CalendarService, private elm: ElementRef) {
    }

    static createDateObjects(startTime: Date, startHour: number, endHour: number, timeInterval: number): IWeekViewRow[][] {
        const times: IWeekViewRow[][] = [],
            currentHour = startTime.getHours(),
            currentDate = startTime.getDate();
        let hourStep,
            minStep;

        if (timeInterval < 1) {
            hourStep = Math.floor(1 / timeInterval);
            minStep = 60;
        } else {
            hourStep = 1;
            minStep = Math.floor(60 / timeInterval);
        }

        for (let hour = startHour; hour < endHour; hour += hourStep) {
            for (let interval = 0; interval < 60; interval += minStep) {
                const row: IWeekViewRow[] = [];
                for (let day = 0; day < 7; day += 1) {
                    const time = new Date(startTime.getTime());
                    time.setHours(currentHour + hour, interval);
                    time.setDate(currentDate + day);
                    row.push({
                        events: [],
                        time: time
                    });
                }
                times.push(row);
            }
        }
        return times;
    }

    static getDates(startTime: Date, n: number): IWeekViewDateRow[] {
        const dates = new Array(n),
            current = new Date(startTime.getTime());
        let i = 0;
        current.setHours(12); // Prevent repeated dates because of timezone bug
        while (i < n) {
            dates[i++] = {
                date: new Date(current.getTime()),
                events: [],
                dayHeader: ''
            };
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    private static calculateWidth(orderedEvents: IDisplayEvent[], size: number, hourParts: number) {
        const totalSize = size * hourParts,
            cells = new Array(totalSize);

        // sort by position in descending order, the right most columns should be calculated first
        orderedEvents.sort((eventA, eventB) => {
            return eventB.position - eventA.position;
        });
        for (let j = 0; j < totalSize; j += 1) {
            cells[j] = {
                calculated: false,
                events: []
            };
        }
        const len = orderedEvents.length;
        for (let j = 0; j < len; j += 1) {
            const event = orderedEvents[j];
            let index = event.startIndex * hourParts + event.startOffset;
            while (index < event.endIndex * hourParts - event.endOffset) {
                cells[index].events.push(event);
                index += 1;
            }
        }

        let i = 0;
        while (i < len) {
            let event = orderedEvents[i];
            if (!event.overlapNumber) {
                const overlapNumber = event.position + 1;
                event.overlapNumber = overlapNumber;
                const eventQueue = [event];
                while ((event = eventQueue.shift())) {
                    let index = event.startIndex * hourParts + event.startOffset;
                    while (index < event.endIndex * hourParts - event.endOffset) {
                        if (!cells[index].calculated) {
                            cells[index].calculated = true;
                            if (cells[index].events) {
                                const eventCountInCell = cells[index].events.length;
                                for (let j = 0; j < eventCountInCell; j += 1) {
                                    const currentEventInCell = cells[index].events[j];
                                    if (!currentEventInCell.overlapNumber) {
                                        currentEventInCell.overlapNumber = overlapNumber;
                                        eventQueue.push(currentEventInCell);
                                    }
                                }
                            }
                        }
                        index += 1;
                    }
                }
            }
            i += 1;
        }
    }

    private static compareEventByStartOffset(eventA: IDisplayEvent, eventB: IDisplayEvent): number {
        return eventA.startOffset - eventB.startOffset;
    }

    ngOnInit() {
        this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
        if (this.dateFormatter && this.dateFormatter.formatWeekViewDayHeader) {
            this.formatDayHeader = this.dateFormatter.formatWeekViewDayHeader;
        } else {
            const datePipe = new DatePipe(this.locale);
            this.formatDayHeader = function (date: Date) {
                return datePipe.transform(date, this.formatWeekViewDayHeader);
            };
        }

        if (this.dateFormatter && this.dateFormatter.formatWeekViewTitle) {
            this.formatTitle = this.dateFormatter.formatWeekViewTitle;
        } else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date: Date) {
                return datePipe.transform(date, this.formatWeekTitle);
            };
        }

        if (this.dateFormatter && this.dateFormatter.formatWeekViewHourColumn) {
            this.formatHourColumnLabel = this.dateFormatter.formatWeekViewHourColumn;
        } else {
            const datePipe = new DatePipe(this.locale);
            this.formatHourColumnLabel = function (date: Date) {
                return datePipe.transform(date, this.formatHourColumn);
            };
        }

        this.refreshView();
        this.hourColumnLabels = this.getHourColumnLabels();
        this.inited = true;

        this.currentDateChangedFromParentSubscription = this.calendarService.currentDateChangedFromParent$.subscribe(currentDate => {
            this.refreshView();
        });

        this.eventSourceChangedSubscription = this.calendarService.eventSourceChanged$.subscribe(() => {
            this.onDataLoaded();
        });
    }

    ngAfterViewInit() {
        const title = this.getTitle();
        this.onTitleChanged.emit(title);

        const me = this;
        setTimeout(function () {
            me.updateScrollGutter();
        }, 0);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.inited) {
            return;
        }

        const eventSourceChange = changes['eventSource'];
        if (eventSourceChange && eventSourceChange.currentValue) {
            this.onDataLoaded();
        }
    }

    ngOnDestroy() {
        if (this.currentDateChangedFromParentSubscription) {
            this.currentDateChangedFromParentSubscription.unsubscribe();
            this.currentDateChangedFromParentSubscription = null;
        }

        if (this.eventSourceChangedSubscription) {
            this.eventSourceChangedSubscription.unsubscribe();
            this.eventSourceChangedSubscription = null;
        }
    }

    move(direction: number) {
        if (direction === 0) {
            return;
        }
        this.direction = direction;
        const adjacent = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
        this.calendarService.setCurrentDate(adjacent);
        this.refreshView();
        this.direction = 0;
    }

    private getHourColumnLabels(): string[] {
        const hourColumnLabels: string[] = [];
        for (let hour = 0, length = this.view.rows.length; hour < length; hour += 1) {
            hourColumnLabels.push(this.formatHourColumnLabel(this.view.rows[hour][0].time));
        }
        return hourColumnLabels;
    }

    getViewData(startTime: Date): IWeekView {
        const dates = WeekViewComponent.getDates(startTime, 7);
        for (let i = 0; i < 7; i++) {
            dates[i].dayHeader = this.formatDayHeader(dates[i].date);
        }

        return {
            rows: WeekViewComponent.createDateObjects(startTime, this.startHour, this.endHour, this.hourSegments),
            dates: dates
        };
    }

    getRange(currentDate: Date): IRange {
        const year = currentDate.getFullYear(),
            month = currentDate.getMonth(),
            date = currentDate.getDate(),
            day = currentDate.getDay();
        let difference = day - this.startingDayWeek;

        if (difference < 0) {
            difference += 7;
        }

        const firstDayOfWeek = new Date(year, month, date - difference);
        const endTime = new Date(year, month, date - difference + 7);

        return {
            startTime: firstDayOfWeek,
            endTime: endTime
        };
    }

    onDataLoaded() {
        const eventSource = this.eventSource,
            len = eventSource ? eventSource.length : 0,
            startTime = this.range.startTime,
            endTime = this.range.endTime,
            utcStartTime = new Date(Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())),
            utcEndTime = new Date(Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate())),
            rows = this.view.rows,
            dates = this.view.dates,
            oneHour = 3600000,
            oneDay = 86400000,
            // add allday eps
            eps = 0.016,
            rangeStartRowIndex = this.startHour * this.hourSegments,
            rangeEndRowIndex = this.endHour * this.hourSegments,
            allRows = 24 * this.hourSegments;

        let allDayEventInRange = false,
            normalEventInRange = false;

        for (let i = 0; i < 7; i += 1) {
            dates[i].events = [];
            dates[i].hasEvent = false;
        }

        for (let day = 0; day < 7; day += 1) {
            for (let hour = 0; hour < this.hourRange; hour += 1) {
                rows[hour][day].events = [];
            }
        }
        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i];
            const eventStartTime = new Date(event.startTime.getTime());
            const eventEndTime = new Date(event.endTime.getTime());

            if (event.allDay) {
                if (eventEndTime <= utcStartTime || eventStartTime >= utcEndTime) {
                    continue;
                } else {
                    allDayEventInRange = true;

                    let allDayStartIndex: number;
                    if (eventStartTime <= utcStartTime) {
                        allDayStartIndex = 0;
                    } else {
                        allDayStartIndex = Math.floor((eventStartTime.getTime() - utcStartTime.getTime()) / oneDay);
                    }

                    let allDayEndIndex: number;
                    if (eventEndTime >= utcEndTime) {
                        allDayEndIndex = Math.ceil((utcEndTime.getTime() - utcStartTime.getTime()) / oneDay);
                    } else {
                        allDayEndIndex = Math.ceil((eventEndTime.getTime() - utcStartTime.getTime()) / oneDay);
                    }

                    const displayAllDayEvent: IDisplayEvent = {
                        event: event,
                        startIndex: allDayStartIndex,
                        endIndex: allDayEndIndex
                    };

                    let eventSet = dates[allDayStartIndex].events;
                    if (eventSet) {
                        eventSet.push(displayAllDayEvent);
                    } else {
                        eventSet = [];
                        eventSet.push(displayAllDayEvent);
                        dates[allDayStartIndex].events = eventSet;
                    }
                    dates[allDayStartIndex].hasEvent = true;
                }
            } else {
                if (eventEndTime <= startTime || eventStartTime >= endTime) {
                    continue;
                } else {
                    normalEventInRange = true;

                    let timeDiff: number;
                    let timeDifferenceStart: number;
                    if (eventStartTime <= startTime) {
                        timeDifferenceStart = 0;
                    } else {
                        timeDiff = eventStartTime.getTime() - startTime.getTime() - (eventStartTime.getTimezoneOffset() - startTime.getTimezoneOffset()) * 60000;
                        timeDifferenceStart = timeDiff / oneHour * this.hourSegments;
                    }

                    let timeDifferenceEnd: number;
                    if (eventEndTime >= endTime) {
                        timeDiff = endTime.getTime() - startTime.getTime() - (endTime.getTimezoneOffset() - startTime.getTimezoneOffset()) * 60000;
                        timeDifferenceEnd = timeDiff / oneHour * this.hourSegments;
                    } else {
                        timeDiff = eventEndTime.getTime() - startTime.getTime() - (eventEndTime.getTimezoneOffset() - startTime.getTimezoneOffset()) * 60000;
                        timeDifferenceEnd = timeDiff / oneHour * this.hourSegments;
                    }

                    const startIndex = Math.floor(timeDifferenceStart),
                        endIndex = Math.ceil(timeDifferenceEnd - eps);
                    let startRowIndex = startIndex % allRows,
                        dayIndex = Math.floor(startIndex / allRows),
                        endOfDay = dayIndex * allRows,
                        startOffset = 0,
                        endOffset = 0;

                    if (this.hourParts !== 1) {
                        if (startRowIndex < rangeStartRowIndex) {
                            startOffset = 0;
                        } else {
                            startOffset = Math.floor((timeDifferenceStart - startIndex) * this.hourParts);
                        }
                    }

                    do {
                        endOfDay += allRows;
                        let endRowIndex: number;
                        if (endOfDay < endIndex) {
                            endRowIndex = allRows;
                        } else {
                            if (endOfDay === endIndex) {
                                endRowIndex = allRows;
                            } else {
                                endRowIndex = endIndex % allRows;
                            }
                            if (this.hourParts !== 1) {
                                if (endRowIndex > rangeEndRowIndex) {
                                    endOffset = 0;
                                } else {
                                    endOffset = Math.floor((endIndex - timeDifferenceEnd) * this.hourParts);
                                }
                            }
                        }
                        if (startRowIndex < rangeStartRowIndex) {
                            startRowIndex = 0;
                        } else {
                            startRowIndex -= rangeStartRowIndex;
                        }
                        if (endRowIndex > rangeEndRowIndex) {
                            endRowIndex = rangeEndRowIndex;
                        }
                        endRowIndex -= rangeStartRowIndex;

                        if (startRowIndex < endRowIndex) {
                            const displayEvent = {
                                event: event,
                                startIndex: startRowIndex,
                                endIndex: endRowIndex,
                                startOffset: startOffset,
                                endOffset: endOffset
                            };
                            let eventSet = rows[startRowIndex][dayIndex].events;
                            if (eventSet) {
                                eventSet.push(displayEvent);
                            } else {
                                eventSet = [];
                                eventSet.push(displayEvent);
                                rows[startRowIndex][dayIndex].events = eventSet;
                            }
                            dates[dayIndex].hasEvent = true;
                        }
                        startRowIndex = 0;
                        startOffset = 0;
                        dayIndex += 1;
                    } while (endOfDay < endIndex);
                }
            }
        }

        if (normalEventInRange) {
            for (let day = 0; day < 7; day += 1) {
                let orderedEvents: IDisplayEvent[] = [];
                for (let hour = 0; hour < this.hourRange; hour += 1) {
                    if (rows[hour][day].events) {
                        rows[hour][day].events.sort(WeekViewComponent.compareEventByStartOffset);
                        orderedEvents = orderedEvents.concat(rows[hour][day].events);
                    }
                }
                if (orderedEvents.length > 0) {
                    this.placeEvents(orderedEvents);
                }
            }
        }

        if (allDayEventInRange) {
            let orderedAllDayEvents: IDisplayEvent[] = [];
            for (let day = 0; day < 7; day += 1) {
                if (dates[day].events) {
                    orderedAllDayEvents = orderedAllDayEvents.concat(dates[day].events);
                }
            }
            if (orderedAllDayEvents.length > 0) {
                this.placeAllDayEvents(orderedAllDayEvents);
            }
        }

        if (this.autoSelect) {
            let findSelected = false;
            let selectedDate;
            for (let r = 0; r < 7; r += 1) {
                if (dates[r].selected) {
                    selectedDate = dates[r];
                    findSelected = true;
                    break;
                }
            }

            if (findSelected) {
                let disabled = false;
                if (this.markDisabled) {
                    disabled = this.markDisabled(selectedDate.date);
                }

                this.onTimeSelected.emit({
                    selectedTime: selectedDate.date,
                    events: selectedDate.events.map(e => e.event),
                    disabled: disabled
                });
            }
        }

        const me = this;
        setTimeout(function () {
            me.updateScrollGutter();
        }, 0);
    }

    refreshView() {
        this.range = this.getRange(this.calendarService.currentDate);

        if (this.inited) {
            const title = this.getTitle();
            this.onTitleChanged.emit(title);
        }
        this.view = this.getViewData(this.range.startTime);
        this.updateCurrentView(this.range.startTime);
        this.calendarService.rangeChanged(this);
    }

    getTitle(): string {
        const firstDayOfWeek = new Date(this.range.startTime.getTime());
        firstDayOfWeek.setHours(12, 0, 0, 0);
        return this.formatTitle(firstDayOfWeek);
    }

    getHighlightClass(date: IWeekViewDateRow): string {
        let className = '';

        if (date.hasEvent) {
            if (className) {
                className += ' ';
            }
            className = 'weekview-with-event';
        }

        if (date.selected) {
            if (className) {
                className += ' ';
            }
            className += 'weekview-selected';
        }

        if (date.current) {
            if (className) {
                className += ' ';
            }
            className += 'weekview-current';
        }

        return className;
    }

    select(selectedTime: Date, events: IDisplayEvent[]) {
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedTime);
        }

        this.onTimeSelected.emit({
            selectedTime: selectedTime,
            events: events.map(e => e.event),
            disabled: disabled
        });
    }

    placeEvents(orderedEvents: IDisplayEvent[]) {
        this.calculatePosition(orderedEvents);
        WeekViewComponent.calculateWidth(orderedEvents, this.hourRange, this.hourParts);
    }

    placeAllDayEvents(orderedEvents: IDisplayEvent[]) {
        this.calculatePosition(orderedEvents);
    }

    overlap(event1: IDisplayEvent, event2: IDisplayEvent): boolean {
        let earlyEvent = event1,
            lateEvent = event2;
        if (event1.startIndex > event2.startIndex || (event1.startIndex === event2.startIndex && event1.startOffset > event2.startOffset)) {
            earlyEvent = event2;
            lateEvent = event1;
        }

        if (earlyEvent.endIndex <= lateEvent.startIndex) {
            return false;
        } else {
            return !(earlyEvent.endIndex - lateEvent.startIndex === 1 && earlyEvent.endOffset + lateEvent.startOffset >= this.hourParts);
        }
    }

    calculatePosition(events: IDisplayEvent[]) {
        const len = events.length,
            isForbidden = new Array(len);
        let maxColumn = 0;

        for (let i = 0; i < len; i += 1) {
            let col: number;
            for (col = 0; col < maxColumn; col += 1) {
                isForbidden[col] = false;
            }
            for (let j = 0; j < i; j += 1) {
                if (this.overlap(events[i], events[j])) {
                    isForbidden[events[j].position] = true;
                }
            }
            for (col = 0; col < maxColumn; col += 1) {
                if (!isForbidden[col]) {
                    break;
                }
            }
            if (col < maxColumn) {
                events[i].position = col;
            } else {
                events[i].position = maxColumn++;
            }
        }
    }

    updateCurrentView(currentViewStartDate: Date) {
        const currentCalendarDate = this.calendarService.currentDate,
            today = new Date(),
            oneDay = 86400000,
            selectedDayDifference = Math.floor((currentCalendarDate.getTime() - currentViewStartDate.getTime() - (currentCalendarDate.getTimezoneOffset() - currentViewStartDate.getTimezoneOffset()) * 60000) / oneDay),
            currentDayDifference = Math.floor((today.getTime() - currentViewStartDate.getTime() - (today.getTimezoneOffset() - currentViewStartDate.getTimezoneOffset()) * 60000) / oneDay),
            view = this.view;

        for (let r = 0; r < 7; r += 1) {
            view.dates[r].selected = false;
        }

        if (selectedDayDifference >= 0 && selectedDayDifference < 7 && this.autoSelect) {
            view.dates[selectedDayDifference].selected = true;
        }

        if (currentDayDifference >= 0 && currentDayDifference < 7) {
            view.dates[currentDayDifference].current = true;
        }
    }

    daySelected(viewDate: IWeekViewDateRow) {
        const selectedDate = viewDate.date,
            dates = this.view.dates,
            currentViewStartDate = this.range.startTime,
            oneDay = 86400000,
            selectedDayDifference = Math.floor((selectedDate.getTime() - currentViewStartDate.getTime() - (selectedDate.getTimezoneOffset() - currentViewStartDate.getTimezoneOffset()) * 60000) / oneDay);

        this.calendarService.setCurrentDate(selectedDate);

        for (let r = 0; r < 7; r += 1) {
            dates[r].selected = false;
        }

        if (selectedDayDifference >= 0 && selectedDayDifference < 7) {
            dates[selectedDayDifference].selected = true;
        }

        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedDate);
        }

        this.onTimeSelected.emit({
            selectedTime: selectedDate,
            events: viewDate.events.map(e => e.event),
            disabled: disabled
        });
    }

    updateScrollGutter() {
        const children = this.elm.nativeElement.children;
        const allDayEventBody = children[1].children[1];
        const allDayEventGutterWidth = allDayEventBody.offsetWidth - allDayEventBody.clientWidth;
        const normalEventBody = children[2];
        const normalEventGutterWidth = normalEventBody.offsetWidth - normalEventBody.clientWidth;
        const gutterWidth = allDayEventGutterWidth || normalEventGutterWidth || 0;
        if (gutterWidth > 0) {
            this.gutterWidth = gutterWidth;
            if (allDayEventGutterWidth <= 0) {
                this.allDayEventGutterWidth = gutterWidth;
            } else {
                this.allDayEventGutterWidth = 0;
            }
            if (normalEventGutterWidth <= 0) {
                this.normalGutterWidth = gutterWidth;
            } else {
                this.normalGutterWidth = 0;
            }
        }
    }
}
