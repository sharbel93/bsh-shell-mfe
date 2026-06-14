import { Component, signal, computed } from '@angular/core';
import { Panel, shortTime } from 'shared';

interface Message {
  id: number; from: string; subject: string; preview: string; body: string;
  time: Date; unread: boolean; folder: string;
}

const NOW = Date.now();
const m = (mins: number) => new Date(NOW - mins * 60000);

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [Panel],
  template: `
    <div class="mail">
      <nav class="folders">
        @for (f of folders; track f.name) {
          <button class="folder" [class.active]="f.name === folder()" (click)="folder.set(f.name)">
            <span>{{ f.name }}</span>
            @if (f.count) { <span class="badge">{{ f.count }}</span> }
          </button>
        }
      </nav>

      <div class="list-pane">
        <lib-panel [heading]="folder()">
          <span panelMeta>{{ visible().length }} items</span>
          @for (msg of visible(); track msg.id) {
            <button class="row" [class.active]="msg.id === selectedId()"
                    [class.unread]="msg.unread" (click)="select(msg.id)">
              <div class="row__top">
                <span class="from">{{ msg.from }}</span>
                <span class="time">{{ fmt(msg.time) }}</span>
              </div>
              <div class="subject">{{ msg.subject }}</div>
              <div class="preview">{{ msg.preview }}</div>
            </button>
          }
        </lib-panel>
      </div>

      <div class="read-pane">
        <lib-panel [heading]="selected()?.subject || 'No message selected'">
          <span panelMeta>{{ selected() ? fmt(selected()!.time) : '' }}</span>
          @if (selected(); as s) {
            <div class="reader">
              <div class="reader__from"><strong>{{ s.from }}</strong></div>
              <p class="reader__body">{{ s.body }}</p>
            </div>
          } @else {
            <div class="empty">Select a message to read it here.</div>
          }
        </lib-panel>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block;height:100%}
    .mail{display:grid;grid-template-columns:200px 320px 1fr;gap:12px;height:100%;padding:12px;box-sizing:border-box}
    .folders{display:flex;flex-direction:column;gap:2px}
    .folder{display:flex;align-items:center;justify-content:space-between;gap:8px;
      background:transparent;border:0;color:var(--text);padding:8px 12px;border-radius:6px;
      font-size:13px;cursor:pointer;text-align:left}
    .folder:hover{background:#26252420}
    .folder.active{background:#0f6cbd33;color:#fff}
    .badge{background:#0f6cbd;color:#fff;border-radius:10px;padding:0 7px;font-size:11px;line-height:18px}
    .row{display:block;width:100%;text-align:left;background:transparent;border:0;
      border-bottom:1px solid var(--stroke);color:var(--text);padding:10px 14px;cursor:pointer}
    .row:hover{background:#2625241a}
    .row.active{background:#0f6cbd26;box-shadow:inset 3px 0 0 #0f6cbd}
    .row__top{display:flex;justify-content:space-between;font-size:13px}
    .row.unread .from{font-weight:700}
    .from{color:#f3f2f1}.time{color:var(--muted);font-size:12px}
    .subject{font-size:13px;margin-top:2px;color:#f3f2f1}
    .row.unread .subject{font-weight:600}
    .preview{font-size:12px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .reader{padding:16px}
    .reader__from{margin-bottom:10px;color:#f3f2f1}
    .reader__body{line-height:1.6;color:#e1dfdd;white-space:pre-wrap}
    .empty{padding:24px;color:var(--muted)}
  `],
})
export class Mail {
  readonly fmt = shortTime;
  folder = signal('Inbox');
  selectedId = signal<number | null>(1);

  folders = [
    { name: 'Inbox', count: 3 }, { name: 'Drafts', count: 0 },
    { name: 'Sent', count: 0 }, { name: 'Archive', count: 0 }, { name: 'Deleted', count: 0 },
  ];

  messages: Message[] = [
    { id: 1, from: 'Pretorious M.', subject: 'BSH release sign-off', folder: 'Inbox', unread: true,
      time: m(7), preview: 'Remotes deploy independently now, shell only needs the manifest swap.',
      body: 'Confirmed the mail and calendar remotes build and deploy on their own pipelines.\n\nThe shell just reads federation.manifest.json per environment, so promoting to staging is a manifest change, not a rebuild.' },
    { id: 2, from: 'Janet K.', subject: 'Customer 360 squad standup', folder: 'Inbox', unread: true,
      time: m(43), preview: 'Moving the onboarding remote behind the same shell rail.',
      body: 'We can expose the onboarding routes the same way mail does and mount them under /onboarding in the shell.' },
    { id: 3, from: 'Azure DevOps', subject: 'Pipeline succeeded: calendar-remote', folder: 'Inbox', unread: true,
      time: m(95), preview: 'Build 22.0.1 published remoteEntry.json to the CDN.',
      body: 'calendar-remote published successfully. remoteEntry.json is live. No shell rebuild required.' },
    { id: 4, from: 'Denis O.', subject: 'Re: shared design tokens', folder: 'Sent', unread: false,
      time: m(220), preview: 'Pushed the Panel component into the shared lib.',
      body: 'Both remotes import lib-panel now, so surfaces stay consistent across independently built apps.' },
  ];

  visible = computed(() => this.messages.filter(x => x.folder === this.folder()));
  selected = computed(() => this.messages.find(x => x.id === this.selectedId()) ?? null);

  select(id: number) {
    this.selectedId.set(id);
    const msg = this.messages.find(x => x.id === id);
    if (msg) { msg.unread = false; }
  }
}
