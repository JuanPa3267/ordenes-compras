"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
    id: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar...", className, disabled }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options
    const filteredOptions = query 
        ? options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const selectedOption = options.find(opt => opt.id === value);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div ref={containerRef} className={cn("relative w-full text-sm", className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
                    !selectedOption && "text-gray-500"
                )}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg text-sm">
                    <div className="sticky top-0 bg-white border-b border-gray-100 p-2 flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none placeholder:text-gray-400"
                            placeholder="Buscar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 shrink-0">
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <ul className="py-1">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-2 text-gray-500 text-center">No se encontraron resultados</li>
                        ) : (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt.id}
                                    onClick={() => handleSelect(opt.id)}
                                    className={cn(
                                        "cursor-pointer px-3 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors",
                                        value === opt.id && "bg-blue-100 text-blue-700 font-medium"
                                    )}
                                >
                                    {opt.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
