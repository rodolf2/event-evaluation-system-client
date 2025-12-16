import { useState, useEffect } from "react";

const images = [
  "/assets/background-image/LV1.jpg",
  "/assets/background-image/LV2.jpg",
  "/assets/background-image/LV3.jpg",
];

export default function CampusCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto-rotate every 5 seconds, reset timer when manually changing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [current]);

  const handleImageClick = (index) => {
    if (index !== current) {
      setCurrent(index);
    }
  };

  // Calculate position for each image relative to current
  const getPosition = (index) => {
    const diff = index - current;

    // Handle wrap-around for 3 images
    if (diff === 0) return "center";
    if (diff === 1 || diff === -(images.length - 1)) return "right";
    if (diff === -1 || diff === images.length - 1) return "left";
    return "hidden";
  };

  return (
    <div className="relative flex justify-center items-center mt-16 overflow-hidden">
      <div className="flex justify-center items-center h-[320px] md:h-[400px] lg:h-[450px] relative w-full max-w-7xl">
        <div className="relative flex justify-center items-center w-full h-full">
          {images.map((img, index) => {
            const position = getPosition(index);

            // Use only transform for animations (GPU accelerated)
            let transform = "translate3d(0, 0, 0) scale(1)";
            let opacity = 1;
            let zIndex = 10;
            let cursor = "cursor-default";

            if (position === "left") {
              transform = "translate3d(-95%, 0, 0) scale(0.85)";
              opacity = 0.6;
              zIndex = 0;
              cursor = "cursor-pointer";
            } else if (position === "right") {
              transform = "translate3d(95%, 0, 0) scale(0.85)";
              opacity = 0.6;
              zIndex = 0;
              cursor = "cursor-pointer";
            } else if (position === "hidden") {
              opacity = 0;
              zIndex = 0;
            }

            return (
              <div
                key={index}
                className={`absolute ${cursor}`}
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transition:
                    "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  willChange: "transform, opacity",
                }}
                onClick={() => handleImageClick(index)}
              >
                <div className="relative w-[450px] h-[290px] md:w-[550px] md:h-[360px] lg:w-[620px] lg:h-[400px] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={img}
                    alt={`Campus ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(rgba(0, 0, 0, 20%), rgba(0, 0, 0, 20%)), linear-gradient(180deg, rgba(31, 52, 99, 0%) 28%, rgba(31, 52, 99, 40%) 51%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
