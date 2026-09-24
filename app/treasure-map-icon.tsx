export default function TreasureMapIcon() {
  return (
    <svg viewBox="0 0 180 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8d894"/>
          <stop offset=".5" stopColor="#f0c978"/>
          <stop offset="1" stopColor="#dca958"/>
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c9fa7"/>
          <stop offset="1" stopColor="#2e747e"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity=".28"/>
        </filter>
      </defs>

      <rect width="180" height="180" rx="34" fill="#17212b"/>
      <path d="M13 18 Q21 9 34 11 L53 8 L69 12 L84 8 L103 11 L119 8 L137 12 Q160 12 168 30 L170 57 L166 80 L171 103 L167 127 L169 148 Q163 166 145 170 L118 168 L96 171 L76 167 L54 171 L33 166 Q14 162 10 145 L12 123 L8 103 L12 81 L9 59 L12 37 Z"
            fill="url(#paper)" stroke="#3d2b1c" strokeWidth="2.4" filter="url(#shadow)"/>

      <path d="M123 33 C140 31 153 37 163 47 L166 64 C155 68 147 78 145 89 C143 99 151 107 165 113 L167 132 C156 139 150 149 144 164 L119 166 C120 151 119 137 124 126 C131 112 134 103 128 94 C121 83 115 75 119 61 C121 53 125 43 123 33 Z"
            fill="url(#water)" stroke="#245765" strokeWidth="2"/>

      <path d="M122 45 C136 40 149 43 162 52 M127 61 C140 57 151 61 164 69 M131 118 C144 113 155 116 165 122 M125 141 C140 137 151 141 160 147"
            fill="none" stroke="#9fd3d4" strokeWidth="1.2" opacity=".75"/>

      <g stroke="#4a3527" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 102 L44 73 L61 101"/>
        <path d="M34 99 L55 66 L77 101"/>
        <path d="M44 102 L68 76 L88 103"/>
        <path d="M26 101 L88 102"/>
        <path d="M43 75 L49 84 M55 67 L61 78 M68 77 L73 86"/>
      </g>

      <g fill="#2f4936" stroke="#203126" strokeWidth=".8">
        <path d="M40 52 l-6 12 h4 l-5 9 h14 l-5-9 h4z"/>
        <path d="M51 47 l-5 10 h3 l-4 8 h12 l-4-8 h3z"/>
        <path d="M58 54 l-5 10 h3 l-4 8 h12 l-4-8 h3z"/>
        <path d="M29 124 l-5 10 h3 l-4 8 h12 l-4-8 h3z"/>
        <path d="M45 132 l-6 12 h4 l-5 9 h14 l-5-9 h4z"/>
        <path d="M104 124 l-6 12 h4 l-5 9 h14 l-5-9 h4z"/>
      </g>

      <g transform="translate(40 38)" stroke="#332719" fill="none" strokeWidth="2">
        <circle cx="0" cy="0" r="21"/>
        <circle cx="0" cy="0" r="13" opacity=".5"/>
        <path d="M0-26 L5-5 L25 0 L5 5 L0 26 L-5 5 L-25 0 L-5-5 Z" fill="#2d2a27"/>
        <path d="M0-18 L2-3 L14 0 L2 3 L0 18 L-2 3 L-14 0 L-2-3 Z" fill="#f1cb7a" strokeWidth="1"/>
      </g>

      <path d="M29 151 C45 143 47 131 57 128 C68 124 78 128 87 119 C97 109 89 97 101 90 C111 84 116 88 125 81"
            fill="none" stroke="#c62f23" strokeWidth="4" strokeLinecap="round" strokeDasharray="9 8"/>

      <g stroke="#c7291d" strokeWidth="8" strokeLinecap="round">
        <path d="M102 83 L132 112"/>
        <path d="M132 83 L102 112"/>
      </g>

      <path d="M95 29 C101 25 108 23 116 24 M86 33 C91 31 94 30 98 30 M76 119 C80 116 84 114 88 113"
            fill="none" stroke="#8f6f42" strokeWidth="1.6" strokeLinecap="round" opacity=".8"/>
    </svg>
  );
}
