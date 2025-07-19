import { cn } from '@/lib/utils';
import { cloneElement, useCallback, useMemo, type ReactElement } from 'react';
import { useBreakpoint, type Breakpoint } from '../hooks/use-breakpoint';

export function Masonry({
  children,
  columns,
  className = '',
}: {
  columns:
    | number
    | {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
      };
  children: ReactElement<{ className?: string }>[];
  className?: string;
}) {
  const allColumns = useMemo(() => {
    if (typeof columns === 'number') {
      return {
        default: columns,
        sm: columns,
        md: columns,
        lg: columns,
        xl: columns,
        '2xl': columns,
      };
    }
    return {
      default: columns.default,
      sm: columns.sm ?? columns.default,
      md: columns.md ?? columns.sm ?? columns.default,
      lg: columns.lg ?? columns.md ?? columns.sm ?? columns.default,
      xl:
        columns.xl ?? columns.lg ?? columns.md ?? columns.sm ?? columns.default,
      '2xl':
        columns['2xl'] ??
        columns.xl ??
        columns.lg ??
        columns.md ??
        columns.sm ??
        columns.default,
    };
  }, [columns]);
  const { breakpoint } = useBreakpoint();

  const columnsFromBreakpoint = useCallback(
    (breakpoint: Breakpoint): number => {
      return allColumns[breakpoint];
    },
    [allColumns]
  );

  const childGrid = useMemo(() => {
    if (!children || children.length === 0) return [];
    const numberOfColumns = columnsFromBreakpoint(breakpoint);
    const columns: ReactElement<{ className?: string }>[][] = [[], [], [], []];
    for (let i = 0; i < children.length; i++) {
      columns[i % numberOfColumns].push(children[i]);
    }
    return columns;
  }, [breakpoint, children, columnsFromBreakpoint]);

  function columnStyles(): string {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }
    const classNameStyles: string[] = [];
    classNameStyles.push(`grid-cols-${columns.default}`);
    if (columns.sm) classNameStyles.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classNameStyles.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classNameStyles.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classNameStyles.push(`xl:grid-cols-${columns.xl}`);
    return classNameStyles.join(' ');
  }

  return (
    <div className={cn('grid gap-4', columnStyles(), className)}>
      {childGrid?.map((childGroup, childGroupIndex) => (
        <div
          key={childGroupIndex}
          className='w-full gap-4'
        >
          {childGroup.map((child, childIndex) => {
            const cloned = cloneElement(child, {
              className: `${child.props?.className} h-auto max-w-full rounded-lg`,
            });
            return <div key={childIndex}>{cloned}</div>;
          })}
        </div>
      ))}
    </div>
  );
}
