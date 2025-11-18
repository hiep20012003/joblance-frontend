import {ReactNode, Children} from "react";
import {ChevronRight} from "lucide-react";
import clsx from "clsx";

export default function Breadcrumb({children, className, highlight = true}: {
    children: ReactNode,
    className?: string,
    highlight?: boolean
}) {
    const childrenArray = Children.toArray(children);

    return (
        <nav className={clsx("flex items-center space-x-2 py-2", className)} aria-label="Breadcrumb">
            {childrenArray.map((child, index) => {
                const isLast = index === childrenArray.length - 1;

                return (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-2"/>
                        )}
                        <span
                            className={isLast && highlight ? "text-gray-900 font-medium" : "text-gray-600 hover:text-primary-500 transition-colors"}>
                            {child}
                        </span>
                    </div>
                );
            })}
        </nav>
    );
}


