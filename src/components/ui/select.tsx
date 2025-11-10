import * as React from "react";
import cn from "&/utils.ts";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9b8] transition-all duration-300 cursor-pointer appearance-none",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";

export { Select };
