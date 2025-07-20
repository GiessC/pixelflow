import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, type ReactNode } from 'react';
import { useBreakpoint, type Breakpoint } from '../hooks/use-breakpoint';

export interface VirtualizedMasonryProps<TItem> {
  items: TItem[];
  numberOfColumns: number | Record<Breakpoint, number>;
  renderItem: (item: TItem) => ReactNode;
  overscan?: number;
}

export function VirtualizedMasonry<TItem>({
  items,
  numberOfColumns: numberOfColumnsProp,
  renderItem,
  overscan = 25,
}: VirtualizedMasonryProps<TItem>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { breakpoint } = useBreakpoint();

  const { getVirtualItems } = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
    overscan,
  });
  const numberOfColumns =
    typeof numberOfColumnsProp === 'number'
      ? numberOfColumnsProp
      : numberOfColumnsProp[breakpoint];

  const columns = Array.from({ length: numberOfColumns }, (_, colIdx) =>
    getVirtualItems().filter((item) => item.index % numberOfColumns === colIdx)
  );

  return (
    <div
      className={'h-full overflow-auto relative p-2'}
      ref={parentRef}
    >
      <div className={'w-full h-full'}>
        <div
          className={'grid gap-3'}
          style={{
            gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((columnItems, columnIndex) => (
            <div key={columnIndex}>
              {columnItems.map((virtualItem) => {
                const item = items[virtualItem.index];
                return renderItem(item);
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
