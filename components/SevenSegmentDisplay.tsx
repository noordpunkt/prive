'use client'

interface SevenSegmentDisplayProps {
  number: number
  size?: 'sm' | 'md' | 'lg'
}

// Six-segment patterns: [top, top-left, top-right, bottom-left, bottom-right, bottom]
const segmentPatterns: Record<number, boolean[]> = {
  0: [true, true, true, true, true, true],          // All segments (for leading zero)
  1: [false, false, true, false, true, false],      // Only right segments
  2: [true, false, true, true, false, true],         // All except top-left and bottom-right
  3: [true, false, true, false, true, true],         // All except top-left and bottom-left
  4: [false, true, true, false, true, false],        // Top-right, bottom-right
}

// SVG paths from model.svg mapped to segments
// Based on the SVG structure showing all segments lit (number 8)
const segmentPaths = {
  // Top horizontal segment (lines 10-11)
  top: [
    "M276.197 2.45314e-05L213 63.3333L276.197 130H473.349V2.45314e-05H276.197Z",
    "M670.803 130L734 66.6666L670.803 1.89946e-05L473.349 2.45314e-05V130L670.803 130Z"
  ],
  // Top-left vertical segment (line 18 - angled)
  topLeft: "M196.985 82L152.32 123.469L149 552.387L315.891 655H452V598.094L276.658 494.269V167.36L196.985 82Z",
  // Top-right vertical segment (line 20 - angled)
  topRight: "M756.015 82L800.68 123.469L804 552.387L637.109 655H501V598.094L676.342 494.269V167.36L756.015 82Z",
  // Bottom-left vertical segment (line 19 - angled)
  bottomLeft: "M196.985 1243L152.32 1201.53L149 772.613L315.891 670H452V726.906L276.658 830.731V1157.64L196.985 1243Z",
  // Bottom-right vertical segment (line 21 - angled)
  bottomRight: "M756.015 1243L800.68 1201.53L804 772.613L637.109 670H501V726.906L676.342 830.731V1157.64L756.015 1243Z",
  // Bottom horizontal segment (lines 16-17)
  bottom: [
    "M276.197 1202L213 1265.33L276.197 1332H473.349V1202H276.197Z",
    "M670.803 1332L734 1268.67L670.803 1202L473.349 1202V1332L670.803 1332Z"
  ],
  // Far left/right segments for number 0 (lines 6-9 - simple rectangular)
  topLeftSimple: "M7.84185e-06 283.059L113 163V664.708H7.84185e-06V283.059Z",
  bottomLeftSimple: "M3.41674e-05 1056.94L113 1177L113 664.708H7.84185e-06L3.41674e-05 1056.94Z",
  topRightSimple: "M966 283.059L853 163V664.708H966V283.059Z",
  bottomRightSimple: "M966 1056.94L853 1177L853 664.708H966L966 1056.94Z",
}

export function SevenSegmentDisplay({ number, size = 'lg' }: SevenSegmentDisplayProps) {
  const pattern = segmentPatterns[number] || segmentPatterns[1]
  
  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-22',
    lg: 'w-20 md:w-24 lg:w-28 h-28 md:h-32 lg:h-36'
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} relative`}
      style={{
        aspectRatio: '966/1332', // Maintain SVG aspect ratio
      }}
    >
      <svg
        viewBox="0 0 966 1332"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top segment */}
        {pattern[0] && segmentPaths.top.map((path, idx) => (
          <path key={`top-${idx}`} d={path} fill="white" fillOpacity={1} />
        ))}
        {!pattern[0] && segmentPaths.top.map((path, idx) => (
          <path key={`top-${idx}`} d={path} fill="white" fillOpacity={0.2} />
        ))}
        
        {/* Top-left segment - use simple for 0, angled for others */}
        <path
          d={number === 0 ? segmentPaths.topLeftSimple : segmentPaths.topLeft}
          fill="white"
          fillOpacity={pattern[1] ? 1 : 0.2}
        />
        
        {/* Top-right segment - use simple for 0, angled for others */}
        <path
          d={number === 0 ? segmentPaths.topRightSimple : segmentPaths.topRight}
          fill="white"
          fillOpacity={pattern[2] ? 1 : 0.2}
        />
        
        {/* Bottom-left segment - use simple for 0, angled for others */}
        <path
          d={number === 0 ? segmentPaths.bottomLeftSimple : segmentPaths.bottomLeft}
          fill="white"
          fillOpacity={pattern[3] ? 1 : 0.2}
        />
        
        {/* Bottom-right segment - use simple for 0, angled for others */}
        <path
          d={number === 0 ? segmentPaths.bottomRightSimple : segmentPaths.bottomRight}
          fill="white"
          fillOpacity={pattern[4] ? 1 : 0.2}
        />
        
        {/* Bottom segment */}
        {pattern[5] && segmentPaths.bottom.map((path, idx) => (
          <path key={`bottom-${idx}`} d={path} fill="white" fillOpacity={1} />
        ))}
        {!pattern[5] && segmentPaths.bottom.map((path, idx) => (
          <path key={`bottom-${idx}`} d={path} fill="white" fillOpacity={0.2} />
        ))}
      </svg>
    </div>
  )
}
