'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';

interface TagInputProps {
    transactionId: string;
    tags: string[];
}

export function TagInput({ transactionId, tags = [] }: TagInputProps) {
    const addTag = useTransactionStore((state) => state.addTag);
    const removeTag = useTransactionStore((state) => state.removeTag);
    const allTags = useTransactionStore((state) => state.getAllTags());

    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    useEffect(() => {
        if (inputValue.length > 0) {
            const filtered = allTags
                .filter((t) => t.toLowerCase().includes(inputValue.toLowerCase()))
                .filter((t) => !tags.includes(t))
                .slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, allTags, tags]);

    const handleAddTag = (tag: string) => {
        const cleanTag = tag.replace(/^#/, '').trim().toLowerCase();
        if (cleanTag && !tags.includes(cleanTag)) {
            addTag(transactionId, cleanTag);
        }
        setInputValue('');
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();
            handleAddTag(inputValue);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(transactionId, tags[tags.length - 1]);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {/* Existing Tags */}
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="group inline-flex items-center gap-1 px-2 py-0.5 
                     bg-gray-100 text-gray-600 text-xs rounded-full
                     hover:bg-gray-200 transition-colors"
                >
                    #{tag}
                    <button
                        onClick={() => removeTag(transactionId, tag)}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center
                       hover:bg-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        ×
                    </button>
                </span>
            ))}

            {/* Add Tag Button / Input */}
            {isEditing ? (
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            setTimeout(() => {
                                setIsEditing(false);
                                setInputValue('');
                            }, 150);
                        }}
                        placeholder="#tag"
                        className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded-full
                       focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg 
                            border border-gray-100 py-1 z-10">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleAddTag(s)}
                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors"
                                >
                                    #{s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-2 py-0.5 text-xs text-gray-400 hover:text-gray-600 
                     hover:bg-gray-100 rounded-full transition-colors"
                >
                    + Tag
                </button>
            )}
        </div>
    );
}
