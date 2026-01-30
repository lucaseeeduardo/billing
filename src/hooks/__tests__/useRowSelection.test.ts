import { renderHook, act } from '@testing-library/react';
import { useRowSelection } from '../useRowSelection';

describe('useRowSelection', () => {
    it('should initialize with empty selection', () => {
        const { result } = renderHook(() => useRowSelection());
        expect(result.current.selectedIds.size).toBe(0);
        expect(result.current.selectionCount).toBe(0);
        expect(result.current.hasSelection).toBe(false);
    });

    it('should toggle single selection', () => {
        const { result } = renderHook(() => useRowSelection());

        act(() => {
            result.current.toggleSelection('1');
        });

        expect(result.current.selectedIds.has('1')).toBe(true);
        expect(result.current.selectionCount).toBe(1);

        act(() => {
            result.current.toggleSelection('1');
        });

        expect(result.current.selectedIds.has('1')).toBe(false);
        expect(result.current.selectionCount).toBe(0);
    });

    it('should toggle all', () => {
        const { result } = renderHook(() => useRowSelection());
        const allIds = ['1', '2', '3'];

        // Select all
        act(() => {
            result.current.toggleAll(allIds);
        });

        expect(result.current.selectionCount).toBe(3);
        expect(Array.from(result.current.selectedIds)).toEqual(expect.arrayContaining(allIds));

        // Deselect all (toggle)
        act(() => {
            result.current.toggleAll(allIds);
        });

        expect(result.current.selectionCount).toBe(0);
    });

    it('should clear selection', () => {
        const { result } = renderHook(() => useRowSelection());

        act(() => {
            result.current.toggleSelection('1');
            result.current.toggleSelection('2');
        });

        expect(result.current.selectionCount).toBe(2);

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectionCount).toBe(0);
    });
});
