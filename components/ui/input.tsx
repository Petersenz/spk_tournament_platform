import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  defaultValue,
  ...props
}: React.ComponentProps<"input">) {
  const finalDefaultValue = defaultValue ?? undefined;

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      {...(finalDefaultValue !== undefined
        ? { defaultValue: finalDefaultValue }
        : {})}
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition-all outline-none placeholder:text-text-tertiary focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-inner",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
