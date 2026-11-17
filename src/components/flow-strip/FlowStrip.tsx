import { ArrowRight } from 'lucide-react';
import { Section } from '../../types';
import { StatusBadge } from '../status-badge/StatusBadge';

interface FlowStripProps {
  sections: Section[];
  onSectionClick: (sectionId: string) => void;
  activeSectionId?: string;
}

/**
 * Production flow across the plant sections, in process order. Horizontally
 * scrollable so all five stations stay reachable on a 390px screen.
 */
export const FlowStrip = ({ sections, onSectionClick, activeSectionId }: FlowStripProps) => (
  <div className="-mx-3 flex snap-x items-stretch gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:px-0">
    {sections.map((section, index) => (
      <div key={section.id} className="flex shrink-0 snap-start items-center gap-2">
        <button
          type="button"
          onClick={() => onSectionClick(section.id)}
          aria-pressed={activeSectionId === section.id}
          className={[
            'flex min-h-[44px] flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            activeSectionId === section.id
              ? 'border-primary-border bg-primary-soft'
              : 'border-border bg-surface hover:bg-surface-hover',
          ].join(' ')}
        >
          <StatusBadge status={section.status} size="sm" />
          <span className="text-xs font-medium text-content">{section.name}</span>
          <span className="text-[11px] text-content-muted tabular-nums">
            {section.machines.length} machine{section.machines.length === 1 ? '' : 's'} ·{' '}
            {section.alertCount.unacknowledged} open
          </span>
        </button>
        {index < sections.length - 1 ? (
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-content-muted" />
        ) : null}
      </div>
    ))}
  </div>
);
