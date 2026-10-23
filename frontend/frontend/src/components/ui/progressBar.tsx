import {cn} from "@/lib/utils"


interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  indeterminate?: boolean;
  value?: number;
}
export default function Progress({ value = 0, indeterminate, className, ...props }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
      {...props}
    >
      {indeterminate ? (
        <>
          <style>
            {`
              @keyframes progress-move {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(250%); }
              }
            `}
          </style>
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-red-500 animate-[progress-move_1.2s_ease-in-out_infinite]" />
        </>
      ) : (
        <div
          className="h-full rounded-full bg-red-500 transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
    </div>
  );
}
