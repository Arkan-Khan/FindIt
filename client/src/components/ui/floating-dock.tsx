import { cn } from "../../lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={cn("hidden md:flex", desktopClassName)} />
      <FloatingDockMobile items={items} className={cn("flex md:hidden", mobileClassName)} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [touchX, setTouchX] = useState<number | null>(null);
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setTouchX(e.touches[0].clientX);
    }
  };
  
  const handleTouchEnd = () => {
    setTouchX(null);
  };
  
  return (
    <motion.div
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={cn(
        "mx-auto h-12 gap-3 items-end rounded-2xl bg-white px-3 pb-2 flex justify-center",
        className
      )}
    >
      {items.map((item, index) => (
        <MobileIconContainer 
          key={item.title} 
          touchX={touchX} 
          index={index}
          totalItems={items.length}
          {...item} 
        />
      ))}
    </motion.div>
  );
};

function MobileIconContainer({
  touchX,
  title,
  icon,
  href,
  index
}: {
  touchX: number | null;
  title: string;
  icon: React.ReactNode;
  href: string;
  index: number;
  totalItems: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const positions = useRef<Array<number>>([]);
  
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      positions.current[index] = centerX;
    }
  }, [index]);

  useEffect(() => {
    if (touchX === null) {
      setIsActive(false);
      return;
    }
    
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const distance = Math.abs(touchX - centerX);

    if (distance < 50) {
      setIsActive(true);
      setShowTitle(true);
    } else {
      setIsActive(false);
      setShowTitle(false);
    }
  }, [touchX, index]);

  const handleTap = () => {
    setShowTitle(true);
    setTimeout(() => setShowTitle(false), 1500);
  };

  const size = isActive ? 50 : 30;
  const iconSize = isActive ? 25 : 15;
  
  return (
    <a 
      href={href} 
      className="inline-block mx-1"
      onClick={() => {
        handleTap();
      }}
    >
      <motion.div
        ref={ref}
        animate={{
          width: size,
          height: size
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="aspect-square rounded-full bg-gray-200 flex items-center justify-center relative"
      >
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-md bg-white border border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-6 w-fit text-xs"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{
            width: iconSize,
            height: iconSize
          }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto h-16 gap-4 items-end rounded-2xl bg-white px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="aspect-square rounded-full bg-gray-200 flex items-center justify-center relative"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-md bg-white border border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}