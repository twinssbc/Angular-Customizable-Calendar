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
    IDayView,
    IDayViewRow,
    IDisplayEvent,
    IEvent,
    ITimeSelected,
    IRange,
    CalendarMode,
    IDateFormatter
} from './calendar';
import {CalendarService} from './calendar.service';
import {
    IDisplayAllDayEvent,
    IDayViewAllDayEventSectionTemplateContext,
    IDayViewNormalEventSectionTemplateContext
} from './calendar';

@Component({
    selector: 'dayview',
    template: `
        <div class="dayview-allday-table">
            <div class="dayview-allday-label">{{allDayLabel}}</div>
            <div class="dayview-allday-content-wrapper">
                <table class="table table-bordered dayview-allday-content-table">
                    <tbody>
                    <tr>
                        <td class="calendar-cell" [ngClass]="{'calendar-event-wrap':view.allDayEvents.length>0}"
                            [ngStyle]="{height: 25*view.allDayEvents.length+'px'}">
                            <ng-template [ngTemplateOutlet]="dayviewAllDayEventSectionTemplate"
                                         [ngTemplateOutletContext]="{allDayEvents:view.allDayEvents,eventTemplate:dayviewAllDayEventTemplate}">
                            </ng-template>
                        </td>
                        <td *ngIf="allDayEventGutterWidth>0" class="gutter-column"
                            [ngStyle]="{width:allDayEventGutterWidth+'px'}"></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="dayview-normal-event-container">
            <table class="table table-bordered table-fixed dayview-normal-event-table">
                <tbody>
                <tr *ngFor="let tm of view.rows; let i = index">
                    <td class="calendar-hour-column text-center">
                        {{hourColumnLabels[i]}}
                    </td>
                    <td class="calendar-cell" tappable (click)="select(tm.time, tm.events)">
                        <ng-template [ngTemplateOutlet]="dayviewNormalEventSectionTemplate"
                                     [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}">
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

        .dayview-allday-label {
            float: left;
            height: 100%;
            line-height: 50px;
            text-align: center;
            width: 50px;
            border-left: 1px solid #ddd;
            border-top: 1px solid #ddd;
        }

        .dayview-allday-content-wrapper {
            margin-left: 50px;
            overflow-x: hidden;
            overflow-y: auto;
            height: 51px;
        }

        .dayview-allday-content-table {
            min-height: 50px;
        }

        .dayview-allday-content-table td {
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }

        .dayview-allday-table {
            height: 50px;
            position: relative;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
        }

        .dayview-normal-event-container {
            overflow-y: auto;
            overflow-x: hidden;
            height: 500px;
        }

        .table > tbody > tr > td.calendar-hour-column {
            padding-left: 0;
            padding-right: 0;
            text-align: center;
            vertical-align: middle;
        }

        @media (max-width: 750px) {
            .dayview-allday-label, .calendar-hour-column {
                width: 31px;
                font-size: 12px;
            }

            .dayview-allday-label {
                padding-top: 4px;
            }

            .table > tbody > tr > td.calendar-hour-column {
                line-height: 12px;
            }

            .dayview-allday-label {
                line-height: 20px;
            }

            .dayview-allday-content-wrapper {
                margin-left: 31px;
            }
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class DayViewComponent implements ICalendarComponent, OnInit, OnChanges {
    @HostBinding('class.dayview') class = true;

    @Input() dayviewAllDayEventTemplate: TemplateRef<IDisplayAllDayEvent>;
    @Input() dayviewNormalEventTemplate: TemplateRef<IDisplayEvent>;
    @Input() dayviewAllDayEventSectionTemplate: TemplateRef<IDayViewAllDayEventSectionTemplateContext>;
    @Input() dayviewNormalEventSectionTemplate: TemplateRef<IDayViewNormalEventSectionTemplateContext>;

    @Input() formatHourColumn: string;
    @Input() formatDayTitle: string;
    @Input() allDayLabel: string;
    @Input() hourParts: number;
    @Input() eventSource: IEvent[];
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

    public view: IDayView;
    public currentViewIndex = 0;
    public direction = 0;
    public mode: CalendarMode = 'day';
    public range: IRange;

    private inited = false;
    private currentDateChangedFromParentSubscription: Subscription;
    private eventSourceChangedSubscription: Subscription;
    private hourColumnLabels: string[];
    private formatTitle: (date: Date) => string;
    private formatHourColumnLabel: (date: Date) => string;
    private hourRange: number;

    public allDayEventGutterWidth: number;
    private normalGutterWidth: number;

    constructor(private calendarService: CalendarService, private elm: ElementRef) {
    }

    private static calculateWidth(orderedEvents: IDisplayEvent[], size: number, hourParts: number) {
        const totalSize = size * hourParts,
            cells: { calculated: boolean; events: IDisplayEvent[]; }[] = new Array(totalSize);

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

    static createDateObjects(startTime: Date, startHour: number, endHour: number, timeInterval: number): IDayViewRow[] {
        const rows: IDayViewRow[] = [],
            currentHour = startTime.getHours(),
            currentDate = startTime.getDate();
        let time: Date,
            hourStep,
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
                time = new Date(startTime.getTime());
                time.setHours(currentHour + hour, interval);
                time.setDate(currentDate);
                rows.push({
                    time: time,
                    events: []
                });
            }
        }
        return rows;
    }

    private static compareEventByStartOffset(eventA: IDisplayEvent, eventB: IDisplayEvent) {
        return eventA.startOffset - eventB.startOffset;
    }

    ngOnInit() {
        this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
        if (this.dateFormatter && this.dateFormatter.formatDayViewTitle) {
            this.formatTitle = this.dateFormatter.formatDayViewTitle;
        } else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date: Date) {
                return datePipe.transform(date, this.formatDayTitle);
            };
        }

        if (this.dateFormatter && this.dateFormatter.formatDayViewHourColumn) {
            this.formatHourColumnLabel = this.dateFormatter.formatDayViewHourColumn;
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
        const adjacentDate = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
        this.calendarService.setCurrentDate(adjacentDate);
        this.refreshView();
        this.direction = 0;
    }

    private getHourColumnLabels(): string[] {
        const hourColumnLabels: string[] = [];
        for (let hour = 0, length = this.view.rows.length; hour < length; hour += 1) {
            hourColumnLabels.push(this.formatHourColumnLabel(this.view.rows[hour].time));
        }
        return hourColumnLabels;
    }

    getViewData(startTime: Date): IDayView {
        return {
            rows: DayViewComponent.createDateObjects(startTime, this.startHour, this.endHour, this.hourSegments),
            allDayEvents: []
        };
    }

    getRange(currentDate: Date): IRange {
        const year = currentDate.getFullYear(),
            month = currentDate.getMonth(),
            date = currentDate.getDate(),
            startTime = new Date(year, month, date),
            endTime = new Date(year, month, date + 1);

        return {
            startTime: startTime,
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
            currentViewIndex = this.currentViewIndex,
            rows = this.view.rows,
            allDayEvents: IDisplayAllDayEvent[] = this.view.allDayEvents = [],
            oneHour = 3600000,
            eps = 0.016,
            rangeStartRowIndex = this.startHour * this.hourSegments,
            rangeEndRowIndex = this.endHour * this.hourSegments;
        let normalEventInRange = false;


        for (let hour = 0; hour < this.hourRange; hour += 1) {
            rows[hour].events = [];
        }

        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i];
            const eventStartTime = new Date(event.startTime.getTime());
            const eventEndTime = new Date(event.endTime.getTime());

            if (event.allDay) {
                if (eventEndTime <= utcStartTime || eventStartTime >= utcEndTime) {
                    continue;
                } else {
                    allDayEvents.push({
                        event: event
                    });
                }
            } else {
                if (eventEndTime <= startTime || eventStartTime >= endTime) {
                    continue;
                } else {
                    normalEventInRange = true;
                }

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

                let startIndex = Math.floor(timeDifferenceStart);
                let endIndex = Math.ceil(timeDifferenceEnd - eps);
                let startOffset = 0;
                let endOffset = 0;
                if (this.hourParts !== 1) {
                    if (startIndex < rangeStartRowIndex) {
                        startOffset = 0;
                    } else {
                        startOffset = Math.floor((timeDifferenceStart - startIndex) * this.hourParts);
                    }
                    if (endIndex > rangeEndRowIndex) {
                        endOffset = 0;
                    } else {
                        endOffset = Math.floor((endIndex - timeDifferenceEnd) * this.hourParts);
                    }
                }

                if (startIndex < rangeStartRowIndex) {
                    startIndex = 0;
                } else {
                    startIndex -= rangeStartRowIndex;
                }
                if (endIndex > rangeEndRowIndex) {
                    endIndex = rangeEndRowIndex;
                }
                endIndex -= rangeStartRowIndex;

                if (startIndex < endIndex) {
                    const displayEvent = {
                        event: event,
                        startIndex: startIndex,
                        endIndex: endIndex,
                        startOffset: startOffset,
                        endOffset: endOffset
                    };

                    let eventSet = rows[startIndex].events;
                    if (eventSet) {
                        eventSet.push(displayEvent);
                    } else {
                        eventSet = [];
                        eventSet.push(displayEvent);
                        rows[startIndex].events = eventSet;
                    }
                }
            }
        }

        if (normalEventInRange) {
            let orderedEvents: IDisplayEvent[] = [];
            for (let hour = 0; hour < this.hourRange; hour += 1) {
                if (rows[hour].events) {
                    rows[hour].events.sort(DayViewComponent.compareEventByStartOffset);

                    orderedEvents = orderedEvents.concat(rows[hour].events);
                }
            }
            if (orderedEvents.length > 0) {
                this.placeEvents(orderedEvents);
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
        this.calendarService.rangeChanged(this);
    }

    getTitle(): string {
        const startingDate = new Date(this.range.startTime.getTime());
        startingDate.setHours(12, 0, 0, 0);
        return this.formatTitle(startingDate);
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
        DayViewComponent.calculateWidth(orderedEvents, this.hourRange, this.hourParts);
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
            isForbidden: boolean[] = new Array(len);
        let col: number,
            maxColumn = 0;

        for (let i = 0; i < len; i += 1) {
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

    eventSelected(event: IEvent) {
        this.onEventSelected.emit(event);
    }

    updateScrollGutter() {
        const children = this.elm.nativeElement.children;
        const allDayEventBody = children[0].children[1];
        const allDayEventGutterWidth = allDayEventBody.offsetWidth - allDayEventBody.clientWidth;
        const normalEventBody = children[1];
        const normalEventGutterWidth = normalEventBody.offsetWidth - normalEventBody.clientWidth;
        const gutterWidth = allDayEventGutterWidth || normalEventGutterWidth || 0;
        if (gutterWidth > 0) {
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
