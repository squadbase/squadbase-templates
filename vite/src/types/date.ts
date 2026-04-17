export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface PresetItem {
  label: string
  getValue: () => DateRange
}
