import type React from "react"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
  description?: string
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}

export type SelectOptions = SelectOption[] | SelectGroup[]

export function isGroupedOptions(
  options: SelectOptions
): options is SelectGroup[] {
  return options.length > 0 && "options" in options[0]
}

export function flattenOptions(options: SelectOptions): SelectOption[] {
  if (isGroupedOptions(options)) {
    return options.flatMap((group) => group.options)
  }
  return options
}
