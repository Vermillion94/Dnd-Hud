import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delay?: number; // Hover delay in ms (default 500)
  longPressDelay?: number; // Long press delay in ms (default 500)
}

function Tooltip({ content, children, delay = 500, longPressDelay = 500 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = (event: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      // Position tooltip above the element
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Mouse events for desktop
  const handleMouseEnter = (event: React.MouseEvent) => {
    hoverTimeoutRef.current = setTimeout(() => {
      showTooltip(event);
    }, delay);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  // Touch events for mobile
  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartTimeRef.current = Date.now();
    longPressTimeoutRef.current = setTimeout(() => {
      showTooltip(event);
      // Vibrate if available (haptic feedback)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, longPressDelay);
  };

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTimeRef.current;

    // If it was a long press and tooltip is visible, keep it visible for a bit
    if (isVisible && touchDuration >= longPressDelay) {
      setTimeout(() => {
        hideTooltip();
      }, 3000); // Auto-hide after 3 seconds
    } else {
      hideTooltip();
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if finger moves
    hideTooltip();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="max-w-xs bg-gray-900 border-2 border-dnd-accent rounded-lg p-3 shadow-medieval"
          >
            <div className="text-sm text-white">{content}</div>
            {/* Arrow pointing down */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #d4af37',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Tooltip;
