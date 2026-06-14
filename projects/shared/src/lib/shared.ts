import { Component, Input } from '@angular/core';

/**
 * Reusable surface used across every micro-frontend so panels look identical
 * regardless of which remote rendered them. Imported by mail and calendar to
 * demonstrate shared-library reuse across independently deployed remotes.
 */
@Component({
  selector: 'lib-panel',
  standalone: true,
  template: `
    <section class="lib-panel">
      <header class="lib-panel__head">
        <span class="lib-panel__title">{{ heading }}</span>
        <span class="lib-panel__meta"><ng-content select="[panelMeta]"></ng-content></span>
      </header>
      <div class="lib-panel__body"><ng-content></ng-content></div>
    </section>
  `,
  styles: [`
    .lib-panel{display:flex;flex-direction:column;height:100%;background:var(--surface,#1b1a19);
      border:1px solid var(--stroke,#3b3a39);border-radius:8px;overflow:hidden}
    .lib-panel__head{display:flex;align-items:center;justify-content:space-between;
      padding:10px 14px;border-bottom:1px solid var(--stroke,#3b3a39);
      font-weight:600;font-size:13px;color:var(--text,#f3f2f1)}
    .lib-panel__meta{font-weight:400;font-size:12px;color:var(--muted,#a19f9d)}
    .lib-panel__body{flex:1;min-height:0;overflow:auto}
  `],
})
export class Panel {
  @Input() heading = '';
}

/** Shared formatting helper, also exercised by both remotes. */
export function shortTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Identity of the workspace shell, shared so remotes can show consistent branding. */
export const WORKSPACE_NAME = 'BSH Workspace';
