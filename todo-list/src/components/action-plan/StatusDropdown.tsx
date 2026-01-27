import * as React from "react"

export type RealizationStatus = 'Cancel' | 'Progress' | 'On Progress' | 'Done' | ''

interface StatusDropdownProps {
    value: string
    onChange: (value: RealizationStatus) => void
    disabled?: boolean
}

const statusConfig: Record<string, { color: string, label: string }> = {
    'Cancel': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancel' },
    'Progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Progress' },
    'On Progress': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'On Progress' },
    'Done': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Done' }
}

export function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
    const validValue = Object.keys(statusConfig).includes(value) ? value : ''
    const currentConfig = validValue ? statusConfig[validValue] : null

    // If we have a valid value, we want to color the select itself
    const selectClassName = `
        w-full h-8 px-2 text-xs font-medium rounded-lg border appearance-none cursor-pointer outline-none transition-all
        ${currentConfig ? currentConfig.color : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `

    return (
        <div className="relative min-w-[100px]">
            <select
                value={validValue}
                onChange={(e) => onChange(e.target.value as RealizationStatus)}
                disabled={disabled}
                className={selectClassName}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }} // Ensure cross-browser removal of default arrow
            >
                <option value="" className="bg-white text-gray-500">-</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key} className="bg-white text-gray-900 font-medium">
                        {config.label}
                    </option>
                ))}
            </select>
            {/* Custom arrow for better styling if needed, or rely on browser default but styled */}
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 ml-2 pointer-events-none ${currentConfig ? 'text-current opacity-60' : 'text-gray-400'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    )
}
