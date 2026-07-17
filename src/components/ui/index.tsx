import React, { forwardRef } from "react";

// ==========================================
// BUTTON COMPONENT
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm focus-visible:outline-teal-600",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:outline-gray-600",
      outline: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm focus-visible:outline-teal-600",
      danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:outline-red-600",
      ghost: "hover:bg-gray-100 text-gray-700 focus-visible:outline-gray-600",
      link: "text-teal-600 hover:underline bg-transparent p-0 focus-visible:outline-teal-600",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ==========================================
// CARD COMPONENTS
// ==========================================
export const Card = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-5 border-b border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold text-gray-900 leading-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`mt-1 text-sm text-gray-500 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

// ==========================================
// FORM COMPONENTS
// ==========================================
export const Label = ({ className = "", children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 ${className}`} {...props}>
    {children}
  </label>
);

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// ==========================================
// ALERT COMPONENT
// ==========================================
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
}

export const Alert = ({ className = "", variant = "info", children, ...props }: AlertProps) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-teal-50 border-teal-200 text-teal-800",
  };

  return (
    <div
      role="alert"
      className={`p-4 border rounded-md flex gap-3 text-sm leading-relaxed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// TABLE COMPONENTS
// ==========================================
export const Table = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto border border-gray-200 rounded-lg bg-white">
    <table className={`min-w-full divide-y divide-gray-200 text-left text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`divide-y divide-gray-200 bg-white ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`hover:bg-gray-50/50 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ className = "", children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-6 py-3.5 font-semibold ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ className = "", children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-4 text-gray-700 ${className}`} {...props}>
    {children}
  </td>
);

// ==========================================
// TABS COMPONENTS
// ==========================================
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export const Tabs = ({ className = "", value, onValueChange, children, ...props }: TabsProps) => {
  // Pass active value down using standard context or simple prop rendering.
  // For simplicity, we just render children.
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ className = "", activeValue, onValueChange, children, ...props }: any) => (
  <div className={`flex gap-1 bg-gray-100 p-1 rounded-md border border-gray-200/50 max-w-max ${className}`} {...props}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { activeValue, onValueChange });
      }
      return child;
    })}
  </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

export const TabsTrigger = ({ className = "", value, activeValue, onValueChange, children, ...props }: TabsTriggerProps) => {
  const isActive = activeValue === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange?.(value)}
      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all focus-ring ${
        isActive
          ? "bg-white text-teal-800 shadow-xs border border-gray-200/40"
          : "text-gray-500 hover:text-gray-800 hover:bg-gray-50/50"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue?: string;
}

export const TabsContent = ({ className = "", value, activeValue, children, ...props }: TabsContentProps) => {
  if (activeValue !== value) return null;
  return (
    <div role="tabpanel" className={`focus-ring rounded-md outline-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};
