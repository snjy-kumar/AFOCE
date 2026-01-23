import { useState, useCallback } from 'react';

/**
 * Custom hook for bulk selection functionality
 * Manages selection state for lists with checkboxes
 * 
 * @param items - Array of items with id property
 * @returns Selection state and helper functions
 * 
 * @example
 * const { selectedIds, toggleItem, toggleAll, isSelected, isAllSelected, clearSelection } = 
 *   useBulkSelection(invoices);
 */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  }, [items, selectedIds.size]);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleItem,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
    clearSelection,
    getSelectedItems,
  };
}
