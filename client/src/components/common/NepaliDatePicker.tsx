/**
 * Nepali Date Picker Component
 * 
 * A dual calendar date picker that supports both Gregorian (AD) and Bikram Sambat (BS) calendars.
 * Features:
 * - Toggle between AD and BS views
 * - Nepali month/day names
 * - Proper date conversion
 * - Keyboard navigation
 * - Accessible design
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import {
    adToBS,
    bsToAD,
    getDaysInBSMonth,
    NEPALI_MONTHS,
    NEPALI_DAYS,
    toNepaliNumeral,
    formatBSDate,
    type NepaliDate
} from '../../lib/nepaliDate';
import { useI18n } from '../../lib/i18n';

interface NepaliDatePickerProps {
    value?: Date | string;
    onChange: (date: Date) => void;
    label?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    showBSToggle?: boolean;
    defaultToBs?: boolean;
    className?: string;
}

export const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
    value,
    onChange,
    label,
    error,
    placeholder = 'Select date',
    disabled = false,
    minDate,
    maxDate,
    showBSToggle = true,
    defaultToBs = false,
    className = '',
}) => {
    const { language, useBikramSambat } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [showBS, setShowBS] = useState(defaultToBs || useBikramSambat);
    const [viewDate, setViewDate] = useState<Date>(() => {
        if (value) {
            return typeof value === 'string' ? new Date(value) : value;
        }
        return new Date();
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse value
    const selectedDate = value
        ? (typeof value === 'string' ? new Date(value) : value)
        : null;

    // Get BS date for view
    const viewBS = adToBS(viewDate);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Navigate months
    const goToPrevMonth = useCallback(() => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setViewDate(newDate);
    }, [viewDate]);

    const goToNextMonth = useCallback(() => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setViewDate(newDate);
    }, [viewDate]);

    // Handle date selection
    const handleDateSelect = useCallback((date: Date) => {
        onChange(date);
        setIsOpen(false);
    }, [onChange]);

    // Generate calendar days for AD
    const generateADCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Padding for start of month
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Days in month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    // Generate calendar days for BS
    const generateBSCalendar = () => {
        const { year, month } = viewBS;
        const daysInMonth = getDaysInBSMonth(year, month);

        // Get first day of BS month in AD to determine day of week
        const firstDayAD = bsToAD({ year, month, day: 1 });
        const startPadding = firstDayAD.getDay();

        const days: ({ bs: NepaliDate; ad: Date } | null)[] = [];

        // Padding for start of month
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Days in month
        for (let i = 1; i <= daysInMonth; i++) {
            const bs: NepaliDate = { year, month, day: i };
            days.push({ bs, ad: bsToAD(bs) });
        }

        return days;
    };

    // Check if date is within valid range
    const isDateDisabled = (date: Date): boolean => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    // Check if date is selected
    const isDateSelected = (date: Date): boolean => {
        if (!selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    // Check if date is today
    const isToday = (date: Date): boolean => {
        return date.toDateString() === new Date().toDateString();
    };

    // Format display value
    const getDisplayValue = (): string => {
        if (!selectedDate) return '';

        if (showBS || useBikramSambat) {
            const bs = adToBS(selectedDate);
            return formatBSDate(bs, 'long', language);
        }

        return selectedDate.toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const dayNames = language === 'ne' ? NEPALI_DAYS.short_ne : NEPALI_DAYS.short_en;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={getDisplayValue()}
                    placeholder={placeholder}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
            w-full px-3 py-2 pl-10 border rounded-lg cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            ${error ? 'border-danger-500' : 'border-neutral-300'}
          `}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                {selectedDate && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(undefined as any);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 p-4 bg-white rounded-lg shadow-lg border border-neutral-200 min-w-[300px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={goToPrevMonth}
                            className="p-1 hover:bg-neutral-100 rounded-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="text-center">
                            <div className="font-semibold text-neutral-900">
                                {showBS ? (
                                    language === 'ne'
                                        ? `${NEPALI_MONTHS.ne[viewBS.month - 1]} ${toNepaliNumeral(viewBS.year)}`
                                        : `${NEPALI_MONTHS.en[viewBS.month - 1]} ${viewBS.year}`
                                ) : (
                                    viewDate.toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-GB', {
                                        year: 'numeric',
                                        month: 'long',
                                    })
                                )}
                            </div>
                            {showBS && (
                                <div className="text-xs text-neutral-500">
                                    {viewDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="p-1 hover:bg-neutral-100 rounded-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Toggle BS/AD */}
                    {showBSToggle && (
                        <div className="flex justify-center mb-3">
                            <div className="inline-flex rounded-lg border border-neutral-200 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setShowBS(false)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${!showBS ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                        }`}
                                >
                                    AD
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBS(true)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${showBS ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                        }`}
                                >
                                    BS
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day, index) => (
                            <div
                                key={index}
                                className="text-center text-xs font-medium text-neutral-500 py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {showBS ? (
                            // BS Calendar
                            generateBSCalendar().map((dayData, index) => (
                                <div key={index}>
                                    {dayData ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(dayData.ad)}
                                            disabled={isDateDisabled(dayData.ad)}
                                            className={`
                        w-full aspect-square flex items-center justify-center text-sm rounded-lg
                        transition-colors
                        ${isDateSelected(dayData.ad)
                                                    ? 'bg-primary-600 text-white'
                                                    : isToday(dayData.ad)
                                                        ? 'bg-primary-100 text-primary-700'
                                                        : isDateDisabled(dayData.ad)
                                                            ? 'text-neutral-300 cursor-not-allowed'
                                                            : 'hover:bg-neutral-100'
                                                }
                      `}
                                        >
                                            {language === 'ne'
                                                ? toNepaliNumeral(dayData.bs.day)
                                                : dayData.bs.day
                                            }
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            ))
                        ) : (
                            // AD Calendar
                            generateADCalendar().map((date, index) => (
                                <div key={index}>
                                    {date ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(date)}
                                            disabled={isDateDisabled(date)}
                                            className={`
                        w-full aspect-square flex items-center justify-center text-sm rounded-lg
                        transition-colors
                        ${isDateSelected(date)
                                                    ? 'bg-primary-600 text-white'
                                                    : isToday(date)
                                                        ? 'bg-primary-100 text-primary-700'
                                                        : isDateDisabled(date)
                                                            ? 'text-neutral-300 cursor-not-allowed'
                                                            : 'hover:bg-neutral-100'
                                                }
                      `}
                                        >
                                            {date.getDate()}
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                setViewDate(new Date());
                                handleDateSelect(new Date());
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            {language === 'ne' ? 'आज' : 'Today'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-neutral-600 hover:text-neutral-700"
                        >
                            {language === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NepaliDatePicker;
