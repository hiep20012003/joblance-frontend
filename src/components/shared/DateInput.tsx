'use client';

import {useState, useRef} from "react";
import clsx from "clsx";
import {Calendar, ChevronLeft, ChevronRight} from "lucide-react";
import MenuDropdown from "./MenuDropdown";
import Input from "@/components/shared/Input";
import {error} from "next/dist/build/output/log";

interface DateInputProps {
    value?: Date | null;
    onChange?: (date: Date) => void;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    dateFormat?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    error?: string;
}

export default function DateInput({
                                      value,
                                      onChange,
                                      placeholder = "Select date",
                                      minDate,
                                      maxDate,
                                      dateFormat = "DD/MM/YYYY",
                                      disabled = false,
                                      readOnly = false,
                                      className,
                                      error
                                  }: DateInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"day" | "month" | "year">("day");
    const [displayedDate, setDisplayedDate] = useState(value || new Date());
    const inputRef = useRef<HTMLInputElement>(null);

    const handleToggle = () => {
        if (disabled || readOnly) return;
        setIsOpen((prev) => !prev);
    };
    const handleClose = () => setIsOpen(false);

    // ------------------ Helpers ------------------
    const formatDate = (date: Date | null): string => {
        if (!date) return "";
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();

        switch (dateFormat) {
            case "MM/DD/YYYY":
                return `${m}/${d}/${y}`;
            case "YYYY-MM-DD":
                return `${y}-${m}-${d}`;
            default:
                return `${d}/${m}/${y}`;
        }
    };

    const isSameDay = (a: Date | null, b: Date) =>
        !!a &&
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const handleDaySelect = (day: number) => {
        const selected = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);

        if (minDate && selected < minDate) return;
        if (maxDate && selected > maxDate) return;

        onChange?.(selected);
        setDisplayedDate(selected);
        handleClose();
    };


    const handleMonthSelect = (month: number) => {
        const newDate = new Date(displayedDate.getFullYear(), month, 1);
        setDisplayedDate(newDate);
        setView("day");
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(year, displayedDate.getMonth(), 1);
        setDisplayedDate(newDate);
        setView("month");
    };

    const getDaysArray = (date: Date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const days = [];
        for (let i = 0; i < start.getDay(); i++) days.push(null);
        for (let d = 1; d <= end.getDate(); d++) days.push(d);
        return days;
    };

    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December",
    ];

    // ------------------ Navigation ------------------
    const prev = () => {
        if (view === "day")
            setDisplayedDate(new Date(displayedDate.getFullYear(), displayedDate.getMonth() - 1));
        else if (view === "month")
            setDisplayedDate(new Date(displayedDate.getFullYear() - 1, displayedDate.getMonth()));
        else setDisplayedDate(new Date(displayedDate.getFullYear() - 12, displayedDate.getMonth()));
    };

    const next = () => {
        if (view === "day")
            setDisplayedDate(new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1));
        else if (view === "month")
            setDisplayedDate(new Date(displayedDate.getFullYear() + 1, displayedDate.getMonth()));
        else setDisplayedDate(new Date(displayedDate.getFullYear() + 12, displayedDate.getMonth()));
    };

    // ------------------ Views ------------------
    const renderYearView = () => {
        const startYear = Math.floor(displayedDate.getFullYear() / 12) * 12;
        return (
            <div className="grid grid-cols-3 gap-2 mt-3">
                {Array.from({length: 12}, (_, i) => startYear + i).map((year) => (
                    <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={clsx(
                            "cursor-pointer py-2 rounded-md text-sm font-medium transition-all",
                            "hover:bg-gray-100 focus:ring-2 focus:ring-primary-500",
                            value?.getFullYear() === year && "bg-primary-500 text-white"
                        )}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    const renderMonthView = () => (
        <div className="grid grid-cols-3 gap-2 mt-3">
            {monthNames.map((m, i) => (
                <button
                    key={m}
                    onClick={() => handleMonthSelect(i)}
                    className={clsx(
                        "cursor-pointer py-2 rounded-md text-sm font-medium transition-all",
                        "hover:bg-gray-100 focus:ring-2 focus:ring-primary-500",
                        value &&
                        value.getMonth() === i &&
                        value.getFullYear() === displayedDate.getFullYear() &&
                        "bg-primary-500 text-white"
                    )}
                >
                    {m.slice(0, 3)}
                </button>
            ))}
        </div>
    );

    const renderDayView = () => {
        const days = getDaysArray(displayedDate);
        const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

        return (
            <>
                <div className="grid grid-cols-7 text-xs text-gray-500 mb-1 font-medium">
                    {dayNames.map((d) => (
                        <div key={d} className="text-center py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, i) => {
                        if (!day) return <div key={i} className="aspect-square"/>;

                        const date = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
                        const disabledDate =
                            (minDate && date < minDate) || (maxDate && date > maxDate);

                        return (
                            <button
                                key={i}
                                onClick={() => !disabledDate && handleDaySelect(day)}
                                disabled={disabledDate}
                                className={clsx(
                                    "aspect-square text-sm rounded-md transition-all",
                                    disabledDate
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
                                    isSameDay(value!, date) && "bg-primary-500 text-white"
                                )}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </>
        );
    };


    // ------------------ Main ------------------
    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                type="text"
                rightIcon={<Calendar className="w-4 h-4 text-gray-600"/>}
                readOnly={readOnly}
                value={formatDate(value || null)}
                onChange={() => {
                }}
                onClick={handleToggle}
                disabled={disabled}
                placeholder={placeholder}
                className={clsx(
                    "transition-all text-base",
                    disabled && "cursor-not-allowed opacity-70",
                    !disabled && !readOnly && "cursor-pointer",
                    className
                )}
                error={error}
            />

            {!disabled && !readOnly && (
                <MenuDropdown isOpen={isOpen} onClose={handleClose} anchorRef={inputRef}>
                    <div className="p-4 bg-white rounded-lg shadow-lg w-80 border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <button onClick={prev}
                                    className="cursor-pointer p-1.5 hover:bg-gray-100 rounded transition">
                                <ChevronLeft className="w-5 h-5 text-gray-600"/>
                            </button>

                            <button
                                className="cursor-pointer flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-primary-600"
                                onClick={() =>
                                    setView(view === "day" ? "month" : view === "month" ? "year" : "day")
                                }
                            >
                                {view === "day" && `${monthNames[displayedDate.getMonth()]} ${displayedDate.getFullYear()}`}
                                {view === "month" && displayedDate.getFullYear()}
                                {view === "year" && (() => {
                                    const start = Math.floor(displayedDate.getFullYear() / 12) * 12;
                                    return `${start} – ${start + 11}`;
                                })()}
                            </button>

                            <button onClick={next}
                                    className="cursor-pointer p-1.5 hover:bg-gray-100 rounded transition">
                                <ChevronRight className="w-5 h-5 text-gray-600"/>
                            </button>
                        </div>

                        {/* Views */}
                        {view === "year" && renderYearView()}
                        {view === "month" && renderMonthView()}
                        {view === "day" && renderDayView()}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    onChange?.(today);
                                    setDisplayedDate(today);
                                    handleClose();
                                }}
                                className="cursor-pointer text-xs text-primary-600 hover:text-primary-700 font-medium transition"
                            >
                                Today
                            </button>

                            <button
                                onClick={handleClose}
                                className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 font-medium transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </MenuDropdown>
            )}
        </div>
    );
}
