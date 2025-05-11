import { cn } from "@/lib/utils";
import React from "react";

type ButtonWithLogoProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    logo?: React.ReactNode; // Make logo optional
};

export const ButtonWithLogo = React.forwardRef<
    HTMLButtonElement,
    ButtonWithLogoProps
>(({ children, className, logo, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
            "justify-center cursor-pointer w-full text-white bg-[#525355] hover:bg-[#525355]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-sm text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 dark:bg-[#050708] transition-all duration-300 ease-in-out group",
            className
            )}
            {...props}
        >
            {logo && (
            <div className="w-8 h-7 me-4 flex items-center justify-center transition-all duration-300 group-hover:-translate-x-14">
                {logo}
            </div>
            )} {/* Render logo only if provided */}
            <span
            className="text-sm text-center text-white transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0"
            >
            {children}
            </span>
            <span
            className="absolute opacity-0 text-sm text-center text-white transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            >
            {children} ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧
            </span>
        </button>
    );
});
ButtonWithLogo.displayName = "ButtonWithLogo";