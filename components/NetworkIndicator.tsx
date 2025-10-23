import React from 'react';
import { NetworkQuality } from '../types';

interface NetworkIndicatorProps {
  quality: NetworkQuality;
}

const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({ quality }) => {
  const qualityLevels = {
    [NetworkQuality.UNKNOWN]: { bars: 4, color: 'bg-gray-500', activeBars: 0, tooltip: 'Chất lượng mạng không xác định' },
    [NetworkQuality.POOR]: { bars: 4, color: 'bg-red-500', activeBars: 1, tooltip: 'Kết nối mạng yếu' },
    [NetworkQuality.AVERAGE]: { bars: 4, color: 'bg-yellow-400', activeBars: 2, tooltip: 'Kết nối mạng trung bình' },
    [NetworkQuality.GOOD]: { bars: 4, color: 'bg-green-500', activeBars: 4, tooltip: 'Kết nối mạng tốt' },
  };

  const { bars, color, activeBars, tooltip } = qualityLevels[quality] || qualityLevels[NetworkQuality.UNKNOWN];
  const barHeights = ['h-2', 'h-3', 'h-4', 'h-5'];

  return (
    <div className="flex items-end space-x-1" title={tooltip}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-colors duration-300 ${barHeights[i]} ${
            i < activeBars ? color : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );
};

export default NetworkIndicator;
