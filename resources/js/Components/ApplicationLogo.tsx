import { SVGAttributes } from 'react';

type ApplicationLogoProps = SVGAttributes<SVGElement> & {
    variant?: 'dark' | 'light';
};

export default function ApplicationLogo({
    variant = 'dark',
    ...props
}: ApplicationLogoProps) {
    const socket = variant === 'dark' ? '#070b14' : '#f4f7fc';
    const topStroke = variant === 'dark' ? '#5b9cff' : '#2563eb';

    return (
        <svg {...props} viewBox="0 0 48 48" fill="none">
            <polyline
                points="11,38 11,12 24,27 37,12 37,38"
                stroke={topStroke}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="11"
                cy="12"
                r="3.2"
                fill={socket}
                stroke={topStroke}
                strokeWidth="2.6"
            />
            <circle
                cx="37"
                cy="12"
                r="3.2"
                fill={socket}
                stroke={topStroke}
                strokeWidth="2.6"
            />
            <circle
                cx="11"
                cy="38"
                r="3.2"
                fill={socket}
                stroke="#3b82f6"
                strokeWidth="2.6"
            />
            <circle
                cx="37"
                cy="38"
                r="3.2"
                fill={socket}
                stroke="#3b82f6"
                strokeWidth="2.6"
            />
            <circle cx="24" cy="27" r="4.2" fill="#8b7bff" />
        </svg>
    );
}
