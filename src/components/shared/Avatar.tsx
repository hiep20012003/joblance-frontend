'use client'

import Image, {StaticImageData} from 'next/image'
import {HTMLAttributes, memo, useMemo} from 'react'
import clsx from 'clsx'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string | StaticImageData
    username: string
    size?: number
    isOnline?: boolean
}

const MIN_DOT_SIZE = 16;
const MAX_DOT_SIZE = 25.6;
const VISUAL_OFFSET_PX = 1;

const Avatar = memo(function Avatar({
                                        src,
                                        username,
                                        size = 32,
                                        className,
                                        isOnline = false,
                                    }: AvatarProps) {
        const initial = username?.charAt(0)?.toUpperCase() ?? 'U'
        const srcString = typeof src === 'string' ? src : src?.src

        const preferredDotSizePx = size / 5;
        const dotSizeCSS = `clamp(1rem, ${preferredDotSizePx}px, 1.6rem)`

        const dotPosition = useMemo(() => {
            const R = size / 2;

            const clampedDotSize = Math.min(Math.max(preferredDotSizePx, MIN_DOT_SIZE), MAX_DOT_SIZE);

            const x_on_circle = R / Math.sqrt(2);
            const css_position = (R - x_on_circle) - (clampedDotSize / 2);

            return css_position + VISUAL_OFFSET_PX;
        }, [size, preferredDotSizePx]);

        return (
            <div
                className="relative inline-block"
                style={{width: size, height: size}}
            >
                {/* Avatar */}
                <div
                    className={clsx(
                        'relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-primary-500 text-white font-bold',
                        className
                    )}
                >
                    {srcString ? (
                        <Image
                            src={srcString}
                            alt={username ?? ''}
                            fill
                            sizes={`${size}px`}
                            style={{objectFit: 'cover'}}
                            priority={true}
                        />
                    ) : (
                        <span style={{fontSize: size / 2}}>{initial}</span>
                    )}
                </div>

                {/* Online indicator */}
                {isOnline && (
                    <span
                        className="absolute border-2 border-white rounded-full z-10"
                        style={{
                            // Kích thước dùng clamp CSS
                            width: dotSizeCSS,
                            height: dotSizeCSS,
                            backgroundColor: '#34D399',
                            // Vị trí dùng tính toán R/sqrt(2)
                            bottom: `${dotPosition}px`,
                            right: `${dotPosition}px`,
                        }}
                    />
                )}
            </div>
        )
    },
// Giữ nguyên memo comparison function
    (prevProps, nextProps) =>
        prevProps.src === nextProps.src &&
        prevProps.username === nextProps.username &&
        prevProps.size === nextProps.size &&
        prevProps.className === nextProps.className &&
        prevProps.isOnline === nextProps.isOnline
)

export default Avatar