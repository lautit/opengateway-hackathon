import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import cn from "&/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#00d9b8] text-gray-900 shadow-lg hover:bg-[#00c4a6] hover:shadow-xl hover:scale-105",
        outline:
          "border border-gray-700 bg-transparent shadow-sm hover:bg-gray-800 hover:text-white",
      },
      size: {
        default: "h-12 px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
