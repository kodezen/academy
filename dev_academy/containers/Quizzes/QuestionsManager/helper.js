export const ExportIcon = ({ size = 20, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* Box */}
        <path
            d="M4 9V16C4 16.55 4.45 17 5 17H15C15.55 17 16 16.55 16 16V9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Arrow going OUT */}
        <path
            d="M10 13V3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />

        <path
            d="M6.5 6.5L10 3L13.5 6.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ImportIcon = ({ size = 20, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* Box */}
        <path
            d="M4 11V16C4 16.55 4.45 17 5 17H15C15.55 17 16 16.55 16 16V11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Arrow going IN */}
        <path
            d="M10 3V13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />

        <path
            d="M6.5 9.5L10 13L13.5 9.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
