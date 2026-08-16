import React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationFrame,
  type MotionValue
} from "framer-motion";

// Hover effect is adopted from https://github.com/PuruVJ/macos-web/blob/main/src/components/dock/DockItem.tsx

const useDockHoverAnimation = (
  mouseX: MotionValue,
  ref: React.RefObject<HTMLElement>,
  dockSize: number,
  dockMag: number
) => {
  const distanceLimit = dockSize * 6;
  const distanceInput = [
    -distanceLimit,
    -distanceLimit / (dockMag * 0.65),
    -distanceLimit / (dockMag * 0.85),
    0,
    distanceLimit / (dockMag * 0.85),
    distanceLimit / (dockMag * 0.65),
    distanceLimit
  ];
  const widthOutput = [
    dockSize,
    dockSize * (dockMag * 0.55),
    dockSize * (dockMag * 0.75),
    dockSize * dockMag,
    dockSize * (dockMag * 0.75),
    dockSize * (dockMag * 0.55),
    dockSize
  ];
  const beyondTheDistanceLimit = distanceLimit + 1;

  const distance = useMotionValue(beyondTheDistanceLimit);
  const widthPX = useSpring(useTransform(distance, distanceInput, widthOutput), {
    stiffness: 1700,
    damping: 90
  });

  const width = useTransform(widthPX, (width) => `${width / 16}rem`);

  useAnimationFrame(() => {
    const el = ref.current;
    const mouseXVal = mouseX.get();
    if (el && mouseXVal !== null) {
      const rect = el.getBoundingClientRect();
      const imgCenterX = rect.left + rect.width / 2;
      const distanceDelta = mouseXVal - imgCenterX;
      distance.set(distanceDelta);
      return;
    }
    distance.set(beyondTheDistanceLimit);
  });

  return { width, widthPX };
};

interface DockItemProps {
  id: string;
  title: string;
  img: string;
  mouseX: MotionValue;
  desktop: boolean;
  openApp: (id: string) => void;
  isOpen: boolean;
  link?: string;
  dockSize: number;
  dockMag: number;
  isBouncing?: boolean;
}

export default function DockItem({
  id,
  title,
  img,
  mouseX,
  desktop,
  openApp,
  isOpen,
  link,
  dockSize,
  dockMag,
  isBouncing
}: DockItemProps) {
  const imgRef = useRef<HTMLElement>(null);
  const { width } = useDockHoverAnimation(mouseX, imgRef, dockSize, dockMag);
  const { winWidth } = useWindowSize();
  
  const [isReceiving, setIsReceiving] = React.useState(false);
  const wasOpen = React.useRef(isOpen);

  React.useEffect(() => {
    if (wasOpen.current && !isOpen) {
      setIsReceiving(true);
      const timer = setTimeout(() => setIsReceiving(false), 350);
      return () => clearTimeout(timer);
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <li
      id={`dock-${id}`}
      onClick={(e) => {
        if (desktop || id === "launchpad") {
          const rect = e.currentTarget.getBoundingClientRect();
          const originX = rect.left + rect.width / 2;
          const originY = rect.top + rect.height / 2;
          document.documentElement.style.setProperty('--launch-origin-x', `${originX}px`);
          document.documentElement.style.setProperty('--launch-origin-y', `${originY}px`);
          openApp(id);
        }
      }}
      className={`relative flex flex-col items-center justify-center ${isBouncing ? 'dock-bounce' : ''} ${isReceiving ? 'dock-receive' : ''}`}
      style={{
        margin: '0 2.5px',
        flexShrink: 0,
        transition: isBouncing ? 'none' : undefined,
      }}
    >
      <p
        className="tooltip absolute inset-x-0 mx-auto w-max rounded-md"
        p="x-3 y-1"
        text="sm c-black"
        style={{
          top: 'calc(-100% - 10px)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.2px',
        }}
      >
        {title}
      </p>
      {(() => {
        const itemStyle =
          winWidth < 640
            ? {
                width: dockSize,
                height: dockSize,
                borderRadius: "22.5%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                aspectRatio: "1 / 1",
                overflow: "hidden",
              }
            : {
                width,
                height: width,
                borderRadius: "22.5%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                aspectRatio: "1 / 1",
                overflow: "hidden",
                willChange: "width, height",
              };

        const content = (
          <motion.div ref={imgRef as any} style={itemStyle}>
            <img
              src={img}
              alt={title}
              title={title}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "22.5%",
                display: "block",
              }}
            />
          </motion.div>
        );

        return link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {content}
          </a>
        ) : (
          content
        );
      })()}
      {/* Shadow beneath icon */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 3,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 80%)',
          filter: 'blur(1.5px)',
          pointerEvents: 'none',
        }}
      />
      {/* Open indicator dot with pulse */}
      <motion.div
        animate={isOpen ? { scale: [1, 1.4, 1], opacity: [0.85, 1, 0.85] } : { scale: 0, opacity: 0 }}
        transition={isOpen ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 3.5,
          height: 3.5,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.95)',
          boxShadow: '0 0 4px rgba(255,255,255,0.8)',
          pointerEvents: 'none',
        }}
      />
    </li>
  );
}
