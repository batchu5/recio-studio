import {cn} from "@/lib/utils"


interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> { 
  indeterminate?: boolean;
  value?: number;
}
export default function Progress({ value = 0, indeterminate, className, ...props }: ProgressProps) {
  return (
    <div
      className={cn(
        "relative w-full h-4 bg-gray-800 rounded-2xl overflow-hidden",
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
                100% { transform: translateX(100%); }
              }
            `}
          </style>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 animate-[progress-move_1.5s_linear_infinite]" />
        </>
      ) : (
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
          style={{ width: `${value}%` }}
        />
      )}
    </div>
  );
}
