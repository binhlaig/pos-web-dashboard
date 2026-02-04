import React from 'react'
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

function ActionButton({
    onClick,
    disabled,
    icon: Icon,
    label,
    intent = "default",
  }: {
    onClick: () => void;
    disabled?: boolean;
    icon: React.ComponentType<any>;
    label: string;
    intent?: "default" | "primary" | "danger";
  }) {
    const base =
      intent === "primary"
        ? "bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
        : intent === "danger"
        ? "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 dark:bg-red-600/80 dark:hover:bg-red-600"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15";
    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn("justify-center", base)}
      >
        <Icon className="mr-2 h-4 w-4" /> {label}
      </Button>
    );
  }

export default ActionButton;
