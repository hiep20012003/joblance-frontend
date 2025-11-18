import {LabelHTMLAttributes} from "react";
import clsx from "clsx";

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    label?: string;
    required?: boolean;
}

export default function FormLabel({label, htmlFor, className, children, required, ...props}: FormLabelProps) {
    return (
        <div className={clsx("w-full")}>
            <label
                htmlFor={htmlFor}
                className={clsx("block text-sm font-semibold text-gray-700 mb-1", className)}
                {...props}
            >
                {label ?? children}
                {required ? '*' : ''}
            </label>
        </div>
    )
}