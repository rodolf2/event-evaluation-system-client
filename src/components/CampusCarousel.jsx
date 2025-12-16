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
      <div className="flex justify-center items-center h-[380px] relative w-full max-w-6xl">
        <div className="relative flex justify-center items-center w-full h-full">
          {images.map((img, index) => {
            const position = getPosition(index);

            let translateX = "0%";
            let scale = "scale-100";
            let opacity = "opacity-100";
            let zIndex = "z-10";
            let width = "w-[550px]";
            let height = "h-[350px]";
            let cursor = "cursor-default";

            if (position === "left") {
              translateX = "-105%";
              scale = "scale-90";
              opacity = "opacity-60";
              zIndex = "z-0";
              width = "w-[450px]";
              height = "h-[280px]";
              cursor = "cursor-pointer";
            } else if (position === "right") {
              translateX = "105%";
              scale = "scale-90";
              opacity = "opacity-60";
              zIndex = "z-0";
              width = "w-[450px]";
              height = "h-[280px]";
              cursor = "cursor-pointer";
            } else if (position === "hidden") {
              opacity = "opacity-0";
              zIndex = "z-0";
            }

            return (
              <div
                key={index}
                className={`absolute transition-all duration-700 ease-out ${zIndex} ${cursor}`}
                style={{
                  transform: `translateX(${translateX})`,
                }}
                onClick={() => handleImageClick(index)}
              >
                <div
                  className={`relative ${width} ${height} rounded-2xl overflow-hidden shadow-lg transition-all duration-700 ease-out ${scale} ${opacity}`}
                >
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
