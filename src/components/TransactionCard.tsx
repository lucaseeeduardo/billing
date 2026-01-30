'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Transaction, getCategoryColor } from '@/types';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { TagInput } from './tags/TagInput';

interface TransactionCardProps {
    transaction: Transaction;
    isDragOverlay?: boolean;
    isSelected?: boolean;
    isSelectionMode?: boolean;
    dragCount?: number;
    onSelect?: (id: string, event: React.MouseEvent) => void;
    onCheckboxClick?: (id: string, event: React.MouseEvent) => void;
}

export function TransactionCard({
    transaction,
    isDragOverlay,
    isSelected = false,
    isSelectionMode = false,
    dragCount = 1,
    onSelect,
    onCheckboxClick,
}: TransactionCardProps) {
    const categorizeTransaction = useTransactionStore((state) => state.categorizeTransaction);
    const categories = useCategoryStore((state) => state.getActiveCategories());
    const getCategoryById = useCategoryStore((state) => state.getCategoryById);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: transaction.id,
        data: {
            ...transaction,
            isSelected,
            dragCount: isSelected ? dragCount : 1,
        },
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    const formatDate = (dateStr: string) => {
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (value: number) => {
        const isNegative = value < 0;
        return (
            <span className={isNegative ? 'text-green-600' : 'text-gray-900'}>
                {isNegative ? '+' : ''} R$ {Math.abs(value).toFixed(2).replace('.', ',')}
            </span>
        );
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value;
        if (categoryId) {
            categorizeTransaction(transaction.id, categoryId);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'SELECT') return;
        onSelect?.(transaction.id, e);
    };

    const handleCheckbox = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCheckboxClick?.(transaction.id, e);
    };

    const category = transaction.categoryId ? getCategoryById(transaction.categoryId) : null;
    const categoryColor = category ? getCategoryColor(category) : null;

    const showDragBadge = isDragOverlay && dragCount > 1;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            className={`
        group relative p-4 rounded-xl border-2 
        bg-white/80 backdrop-blur-sm
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105' : ''}
        ${isDragOverlay ? 'shadow-2xl rotate-2 scale-105' : 'shadow-sm hover:shadow-md'}
        ${isSelected
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-200'
                    : categoryColor
                        ? 'border-l-4'
                        : 'border-gray-200 hover:border-blue-300'
                }
        ${onSelect ? 'cursor-pointer' : ''}
      `}
            {...attributes}
            {...listeners}
        >
            {/* Drag Count Badge */}
            {showDragBadge && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white 
                        text-sm font-bold flex items-center justify-center shadow-lg
                        animate-pulse z-10">
                    {dragCount}
                </div>
            )}

            {categoryColor && !isSelected && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: categoryColor.main }}
                />
            )}

            <div className="flex items-start gap-3">
                {/* Checkbox */}
                {isSelectionMode && (
                    <div
                        className="flex-shrink-0 pt-1"
                        onClick={handleCheckbox}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                         cursor-pointer transition-colors"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatDate(transaction.date)}
                        </span>
                        <div className="text-right font-semibold text-lg">
                            {formatCurrency(transaction.amount)}
                        </div>
                    </div>

                    <h3 className="font-medium text-gray-800 mb-3 line-clamp-2">
                        {transaction.title}
                    </h3>

                    {/* Tags */}
                    <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                        <TagInput transactionId={transaction.id} tags={transaction.tags || []} />
                    </div>

                    {!transaction.categoryId && (
                        <select
                            value=""
                            onChange={handleCategoryChange}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                         bg-gray-50 hover:bg-white focus:bg-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 cursor-pointer"
                        >
                            <option value="" disabled>
                                Selecionar categoria...
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icone} {cat.nome}
                                </option>
                            ))}
                        </select>
                    )}

                    {category && (
                        <div
                            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: categoryColor?.light,
                                color: categoryColor?.text,
                            }}
                        >
                            {category.icone} {category.nome}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
