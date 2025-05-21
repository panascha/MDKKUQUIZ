import { cn } from "@/lib/utils";
import React from "react";

type ButtonWithLogoProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    logo?: React.ReactNode;
    emoji?: React.ReactNode; // Add emoji prop
};

const DEFAULT_EMOJI = <>ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧</>;

export const ButtonWithLogo = React.forwardRef<
    HTMLButtonElement,
    ButtonWithLogoProps
>(({ children, className, logo, emoji = DEFAULT_EMOJI, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                "relative justify-center cursor-pointer w-full text-white bg-[#525355] hover:bg-[#525355]/90 focus:ring-2 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-sm text-base px-4 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 dark:bg-[#050708] transition-all duration-300 ease-in-out group",
                className
            )}
            {...props}
        >
            {logo && (
                <div className="w-8 h-7 me-4 flex items-center justify-center transition-all duration-300 group-hover:-translate-x-14 group-hover:opacity-0 group-focus-within:-translate-x-14 group-focus-within:opacity-0">
                    {logo}
                </div>
            )}
            <span
                className="text-base text-center text-white transition-all duration-300 group-hover:translate-x-8 group-hover:opacity-0 group-focus-within:translate-x-8 group-focus-within:opacity-0"
            >
                {children}
            </span>
            <span
                className="absolute opacity-0 text-base text-center text-white transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0"
            >
                {typeof children === "string" && children.includes("\n") ? (
                    <>
                        {children.split("\n").map((line, idx, arr) =>
                            idx === arr.length - 1 ? (
                                <React.Fragment key={idx}>
                                    {line} <span>{emoji}</span>
                                </React.Fragment>
                            ) : (
                                <React.Fragment key={idx}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            )
                        )}
                    </>
                ) : (
                    <>
                        {children} <span>{emoji}</span>
                    </>
                )}
            </span>
        </button>
    );
});
ButtonWithLogo.displayName = "ButtonWithLogo";

// <ButtonWithLogo
//     className="w-[40%] md:w-[30%] lg:w-[15%]"
//     logo={<Image src="/path/to/logo.png" alt="Logo" width={32} height={32} />}
//     emoji={<span role="img" aria-label="emoji">😊</span>}
//     onClick={() => console.log("Button clicked")}
// >