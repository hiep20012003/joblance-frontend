import React from 'react';

interface SpinnerProps {
    size?: number | string; // number = px, string = Tailwind class or css unit
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({size = 24, className}) => {
    const sizeValue = `${size}px`;

    return (
        <div
            className="
        custom-loader
        text-[var(--color-primary-500)]
        overflow-hidden
        rounded-full
        relative
        transform-gpu
        sr-only
        md:not-sr-only
      "
            style={{
                width: sizeValue,
                height: sizeValue,
                fontSize: sizeValue,
                textIndent: '-9999em',
            }}
        >
        </div>
    );
};

export default Spinner;
