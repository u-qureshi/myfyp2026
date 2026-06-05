'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Info } from 'lucide-react'

function HelpBox({ title, children }) {
  return (
    <div className="rounded-lg border border-[#0c1f3f]/10 bg-slate-50 p-3 text-sm text-slate-700 space-y-1.5">
      {title && <p className="font-medium text-[#0c1f3f]">{title}</p>}
      {children}
    </div>
  )
}

function WeightHint({ weight, lowText, highText }) {
  const w = weight ?? 0
  let hint = 'Moderate priority — this preference will influence scheduling to a reasonable extent.'
  if (w === 0) hint = lowText
  else if (w <= 30) hint = 'Low priority — minimal impact on the generated timetable.'
  else if (w >= 80) hint = highText
  else if (w >= 50) hint = 'Standard priority — noticeable but balanced influence on the schedule.'

  return (
    <p className="text-xs text-[#0c1f3f] bg-[#c9a227]/10 border border-[#c9a227]/25 rounded px-2 py-1.5 mt-2">
      <strong>At {w}%:</strong> {hint}
    </p>
  )
}

export function ConstraintGuideIntro() {
  return (
    <HelpBox title="How scheduling preferences work">
      <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
        <li>
          <strong>Hard constraints</strong> are always enforced: no faculty double-booking, no room
          conflicts, section clashes prevented, and room capacity respected.
        </li>
        <li>
          <strong>Switch OFF</strong> — this preference is excluded entirely from timetable generation.
        </li>
        <li>
          <strong>Weight 0%</strong> — enabled but given negligible influence (near-neutral).
        </li>
        <li>
          <strong>Weight 100%</strong> — highest priority; the optimizer will strongly favour schedules
          that satisfy this preference.
        </li>
      </ul>
    </HelpBox>
  )
}

export function MinBreakConstraint({ value, onChange }) {
  const v = value ?? 0
  let effect =
    'Back-to-back classes are permitted with no mandatory gap between sessions on the same day.'
  if (v > 0 && v < 20) {
    effect = `A minimum ${v}-minute gap is required between consecutive classes — allows a brief transition period.`
  } else if (v >= 20 && v < 45) {
    effect = `At least ${v} minutes between classes on the same day — provides a short rest between sessions.`
  } else if (v >= 45) {
    effect = `Extended break of ${v} minutes — classes may be spaced further apart, with more free time during the day.`
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-[#c9a227] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <Label className="text-base">Minimum break between classes</Label>
          <p className="text-xs text-muted-foreground">
            Minimum rest time required between your classes (or your section&apos;s classes) on the same
            day.
          </p>
        </div>
      </div>

      <HelpBox>
        <p>
          <strong>0 min:</strong> Consecutive classes allowed — no minimum rest period.
        </p>
        <p>
          <strong>10–30 min:</strong> Short break — a brief interval between consecutive sessions.
        </p>
        <p>
          <strong>45–60 min:</strong> Extended break — more free time, but scheduling may be less
          flexible.
        </p>
      </HelpBox>

      <Label>Selected: {v} minutes</Label>
      <Slider value={[v]} onValueChange={([next]) => onChange(next)} min={0} max={60} step={5} />

      <p className="text-xs text-[#0c1f3f] bg-[#c9a227]/10 border border-[#c9a227]/25 rounded px-2 py-1.5">
        <strong>At {v} min:</strong> {effect}
      </p>
    </div>
  )
}

const SOFT_CONSTRAINTS = [
  {
    key: 'minimizeWalking',
    weight: 'walkingWeight',
    label: 'Minimize walking distance',
    summary:
      'Prefer scheduling classes in the same or nearby rooms to reduce travel between buildings.',
    off: 'Room location is not considered — classes may be assigned across distant rooms.',
    weightLow: 'Minimal emphasis on proximity — room distance has little effect on scheduling.',
    weightHigh:
      'Strong emphasis on proximity — consecutive classes will be placed in nearby rooms where possible.',
    examples: [
      { at: '0%', text: 'Room location is ignored; any valid slot may be assigned.' },
      { at: '100%', text: 'Schedules that minimise walking between classes are strongly preferred.' }
    ]
  },
  {
    key: 'balancedWorkload',
    weight: 'workloadWeight',
    label: 'Balanced daily workload',
    summary:
      'Distribute classes evenly across the week to avoid heavy days and empty days.',
    off: 'Classes may cluster on certain days — an uneven weekly pattern is acceptable.',
    weightLow: 'Slight spread across the week; some days may still be busier than others.',
    weightHigh:
      'Strong balance — the optimizer will aim for a similar number of classes each weekday.',
    examples: [
      { at: '0%', text: 'An uneven pattern is possible (e.g. three busy days and two light days).' },
      { at: '100%', text: 'Each weekday should carry a similar class load where feasible.' }
    ]
  },
  {
    key: 'preferredSlots',
    weight: 'slotsWeight',
    label: 'Preferred time slots',
    summary: 'Prefer earlier time slots in the day — fewer late-afternoon classes.',
    off: 'Time of day is not prioritised — morning and afternoon slots are treated equally.',
    weightLow: 'Slight preference for earlier slots; later times may still be assigned.',
    weightHigh:
      'Strong morning preference — most classes will be scheduled in earlier time blocks.',
    examples: [
      { at: '0%', text: 'A 9:00 AM slot and a 3:00 PM slot are equally acceptable.' },
      { at: '100%', text: 'Morning slots are filled first before later periods are used.' }
    ]
  },
  {
    key: 'minimizeGaps',
    weight: 'gapsWeight',
    label: 'Minimize gaps between classes',
    summary:
      'Reduce free periods between classes — prefer a compact daily schedule.',
    off: 'Free periods between classes are acceptable (e.g. a morning class and an afternoon class).',
    weightLow: 'Some gap reduction; a free period between classes may still remain.',
    weightHigh:
      'Strong compaction — classes grouped in consecutive or near-consecutive time blocks.',
    examples: [
      { at: '0%', text: 'A gap between sessions is allowed (e.g. morning classes, free midday, one afternoon class).' },
      { at: '100%', text: 'Classes clustered together (e.g. a continuous 9:00 AM–12:00 PM block).' }
    ]
  }
]

export function SoftConstraintField({ config, constraints, onChange }) {
  const enabled = constraints[config.key] ?? true
  const weight = constraints[config.weight] ?? 75

  const setEnabled = (checked) => {
    onChange({ ...constraints, [config.key]: checked })
  }

  const setWeight = (value) => {
    onChange({ ...constraints, [config.weight]: value })
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2 flex-1">
          <Info className="h-4 w-4 text-[#c9a227] mt-0.5 shrink-0" />
          <div className="space-y-1">
            <Label className="text-base">{config.label}</Label>
            <p className="text-xs text-muted-foreground">{config.summary}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-muted-foreground">{enabled ? 'ON' : 'OFF'}</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <HelpBox>
        <p>
          <strong>Switch OFF:</strong> {config.off}
        </p>
        <p>
          <strong>Weight 0%:</strong> {config.examples.find((e) => e.at === '0%')?.text}
        </p>
        <p>
          <strong>Weight 100%:</strong> {config.examples.find((e) => e.at === '100%')?.text}
        </p>
      </HelpBox>

      {enabled ? (
        <div>
          <Label className="text-xs">Priority weight: {weight}%</Label>
          <Slider
            className="mt-2"
            value={[weight]}
            onValueChange={([v]) => setWeight(v)}
            min={0}
            max={100}
            step={5}
          />
          <WeightHint weight={weight} lowText={config.weightLow} highText={config.weightHigh} />
        </div>
      ) : (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
          This preference is disabled and will be excluded when your timetable is generated.
        </p>
      )}
    </div>
  )
}

export { SOFT_CONSTRAINTS }
