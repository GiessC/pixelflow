import { cn } from '@/lib/utils';
import { cloneElement, useMemo, type ReactElement } from 'react';

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
      };
  children: ReactElement<{ className?: string }>[];
  className?: string;
}) {
  const childGrid = useMemo(() => {
    if (!children || children.length === 0) return [];
    const columns: ReactElement<{ className?: string }>[][] = [[], [], [], []];
    for (let i = 0; i < children.length; i++) {
      columns[i % 4].push(children[i]);
    }
    return columns;
  }, [children]);

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
