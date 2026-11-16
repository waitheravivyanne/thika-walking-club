function TWCFootprints({ size = 35, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* LEFT HIKING BOOT */}

      <g transform="rotate(-17 32 43)">
        <path
          d="M24 5
             C16 7 12 17 12 29
             L10 49
             C9 58 13 64 21 65
             L32 67
             C40 68 45 62 46 53
             L48 29
             C49 16 43 6 34 4
             C30 3 27 4 24 5Z"
          fill="currentColor"
        />

        {/* Boot tread */}

        <path
          d="M18 14 L40 17
             M15 23 L43 26
             M13 33 L44 36
             M12 43 L43 46
             M13 53 L40 56"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M22 12 L22 27
             M33 13 L32 29
             M19 35 L18 48
             M31 37 L30 53"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* RIGHT HIKING BOOT */}

      <g transform="rotate(17 69 43)">
        <path
          d="M66 5
             C57 7 52 17 53 29
             L54 49
             C54 58 59 64 67 65
             L78 67
             C86 68 91 62 90 53
             L89 29
             C88 16 82 6 73 4
             C70 3 68 4 66 5Z"
          fill="currentColor"
        />

        {/* Boot tread */}

        <path
          d="M58 14 L80 17
             M56 23 L85 26
             M55 33 L87 36
             M56 43 L88 46
             M59 53 L86 56"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M64 12 L64 27
             M75 13 L75 29
             M62 35 L63 48
             M74 37 L75 53"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default TWCFootprints;
