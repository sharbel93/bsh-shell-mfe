import { Component, signal, computed } from '@angular/core';
import { Panel, shortTime } from 'shared';

interface Ev { day: number; title: string; at: Date; tag: string; }

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [Panel],
  template: `
    <div class="cal">
      <div class="grid-pane">
        <lib-panel [heading]="monthLabel">
          <span panelMeta>{{ events.length }} events</span>
          <div class="weekhead">
            @for (d of weekdays; track d) { <span>{{ d }}</span> }
          </div>
          <div class="grid">
            @for (cell of cells(); track $index) {
              <button class="cell" [class.blank]="cell === 0" [class.today]="cell === today"
                      [class.has]="hasEvent(cell)" [class.sel]="cell === selectedDay()"
                      (click)="cell && selectedDay.set(cell)">
                @if (cell) {
                  <span class="num">{{ cell }}</span>
                  @if (hasEvent(cell)) { <span class="dot"></span> }
                }
              </button>
            }
          </div>
        </lib-panel>
      </div>

      <div class="agenda-pane">
        <lib-panel [heading]="'Agenda · ' + monthName + ' ' + selectedDay()">
          <span panelMeta>{{ forDay().length }} items</span>
          @if (forDay().length) {
            @for (e of forDay(); track e.title) {
              <div class="ev" [attr.data-tag]="e.tag">
                <span class="ev__time">{{ fmt(e.at) }}</span>
                <span class="ev__title">{{ e.title }}</span>
                <span class="ev__tag">{{ e.tag }}</span>
              </div>
            }
          } @else {
            <div class="empty">No events. Pick a highlighted day.</div>
          }
        </lib-panel>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block;height:100%}
    .cal{display:grid;grid-template-columns:1fr 340px;gap:12px;height:100%;padding:12px;box-sizing:border-box}
    .weekhead,.grid{display:grid;grid-template-columns:repeat(7,1fr)}
    .weekhead{padding:10px 8px 4px;color:var(--muted);font-size:12px;text-align:center}
    .grid{gap:4px;padding:8px}
    .cell{aspect-ratio:1/1;background:#26252415;border:1px solid var(--stroke);border-radius:6px;
      color:var(--text);cursor:pointer;position:relative;display:flex;align-items:flex-start;justify-content:flex-start}
    .cell.blank{background:transparent;border:0;cursor:default}
    .cell .num{font-size:12px;padding:6px}
    .cell:hover:not(.blank){background:#2625243a}
    .cell.today{box-shadow:inset 0 0 0 2px #0f6cbd}
    .cell.sel{background:#0f6cbd33}
    .dot{position:absolute;bottom:8px;left:8px;width:6px;height:6px;border-radius:50%;background:#0f6cbd}
    .ev{display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:8px;
      padding:12px 14px;border-bottom:1px solid var(--stroke)}
    .ev__time{color:var(--muted);font-size:12px}
    .ev__title{color:#f3f2f1;font-size:13px}
    .ev__tag{font-size:11px;color:#fff;background:#0f6cbd;border-radius:10px;padding:1px 8px}
    .ev[data-tag=Review]  .ev__tag{background:#8764b8}
    .ev[data-tag=Standup] .ev__tag{background:#107c10}
    .empty{padding:24px;color:var(--muted)}
  `],
})
export class Calendar {
  readonly fmt = shortTime;
  weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  private ref = new Date();
  today = this.ref.getDate();
  monthName = this.ref.toLocaleString([], { month: 'long' });
  monthLabel = this.ref.toLocaleString([], { month: 'long', year: 'numeric' });

  private at = (h: number, mi = 0) => { const d = new Date(this.ref); d.setHours(h, mi, 0, 0); return d; };

  events: Ev[] = [
    { day: this.today,       title: 'BSH squad standup',         at: this.at(9, 15),  tag: 'Standup' },
    { day: this.today,       title: 'Federation architecture review', at: this.at(11, 0), tag: 'Review' },
    { day: this.today,       title: 'Remote deploy sync',         at: this.at(15, 30), tag: 'Meeting' },
    { day: Math.min(this.today + 2, 28), title: 'QBR prep',       at: this.at(13, 0),  tag: 'Review' },
    { day: Math.max(this.today - 3, 1),  title: 'Shared lib design', at: this.at(10, 0), tag: 'Meeting' },
  ];

  selectedDay = signal(this.today);

  cells = computed(() => {
    const y = this.ref.getFullYear(), mo = this.ref.getMonth();
    const lead = new Date(y, mo, 1).getDay();
    const days = new Date(y, mo + 1, 0).getDate();
    return [...Array(lead).fill(0), ...Array.from({ length: days }, (_, i) => i + 1)];
  });

  hasEvent = (day: number) => !!day && this.events.some(e => e.day === day);
  forDay = computed(() => this.events.filter(e => e.day === this.selectedDay())
    .sort((a, b) => a.at.getTime() - b.at.getTime()));
}
