/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/design-system/components/Typography.tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

// ============================================================================
// TEXT COMPONENT - For paragraphs and body text
// ============================================================================

const textVariants = cva("text-foreground", {
  variants: {
    size: {
      xs: "text-xs leading-4",
      sm: "text-sm leading-5",
      base: "text-base leading-6",
      lg: "text-lg leading-7",
      xl: "text-xl leading-8",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      subtle: "text-foreground/70",
      error: "text-destructive",
      success: "text-green-600 dark:text-green-500",
      warning: "text-amber-600 dark:text-amber-500",
      primary: "text-primary",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    variant: "default",
    align: "left",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label";
  truncate?: boolean;
  clamp?: 1 | 2 | 3 | 4 | 5;
}

// Use HTMLElement for the ref type since it can be multiple element types
export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      size,
      weight,
      variant,
      align,
      as: Component = "p",
      truncate,
      clamp,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          textVariants({ size, weight, variant, align }),
          truncate && "truncate",
          clamp && `line-clamp-${clamp}`,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = "Text";

// ============================================================================
// HEADING COMPONENT - For titles and headings
// ============================================================================

const headingVariants = cva("font-bold text-foreground tracking-tight", {
  variants: {
    level: {
      h1: "text-4xl md:text-5xl lg:text-6xl leading-tight",
      h2: "text-3xl md:text-4xl lg:text-5xl leading-tight",
      h3: "text-2xl md:text-3xl lg:text-4xl leading-snug",
      h4: "text-xl md:text-2xl lg:text-3xl leading-snug",
      h5: "text-lg md:text-xl lg:text-2xl leading-normal",
      h6: "text-base md:text-lg lg:text-xl leading-normal",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
    variant: {
      default: "text-foreground",
      gradient:
        "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
      muted: "text-muted-foreground",
      accent: "text-primary",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    level: "h2",
    weight: "bold",
    variant: "default",
    align: "left",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      className,
      level,
      weight,
      variant,
      align,
      as,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as || (level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");

    return (
      <Component
        ref={ref as any}
        className={cn(
          headingVariants({ level: level || (as as any), weight, variant, align }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = "Heading";

// ============================================================================
// LABEL COMPONENT - For form labels
// ============================================================================

const labelVariants = cva("text-sm font-medium leading-none", {
  variants: {
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      error: "text-destructive",
    },
    required: {
      true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    required: false,
  },
});

export interface LabelTextProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelTextProps>(
  ({ className, variant, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant, required }), className)}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = "Label";

// ============================================================================
// DISPLAY TEXT - For large hero text
// ============================================================================

const displayVariants = cva(
  "font-extrabold text-foreground tracking-tight leading-none",
  {
    variants: {
      size: {
        sm: "text-5xl md:text-6xl lg:text-7xl",
        md: "text-6xl md:text-7xl lg:text-8xl",
        lg: "text-7xl md:text-8xl lg:text-9xl",
      },
      variant: {
        default: "text-foreground",
        gradient:
          "bg-gradient-to-r from-primary via-purple-500 to-primary/60 bg-clip-text text-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface DisplayProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof displayVariants> {
  as?: "h1" | "h2" | "h3" | "p" | "div";
}

export const Display = React.forwardRef<HTMLElement, DisplayProps>(
  ({ className, size, variant, as: Component = "h1", children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(displayVariants({ size, variant }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Display.displayName = "Display";

// ============================================================================
// CODE TEXT - For code snippets
// ============================================================================

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  block?: boolean;
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, block, children, ...props }, ref) => {
    if (block) {
      return (
        <pre
          ref={ref as any}
          className={cn(
            "rounded-lg bg-muted p-4 overflow-x-auto",
            "text-sm font-mono",
            className
          )}
          {...props}
        >
          <code>{children}</code>
        </pre>
      );
    }

    return (
      <code
        ref={ref}
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem]",
          "text-sm font-mono font-semibold",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
);
Code.displayName = "Code";