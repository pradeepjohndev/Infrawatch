import { useCallback, useEffect, useRef, useState } from "react";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";

const slides = [
    {
        title: "Effortlessly manage your Assets and Operations.",
        subtitle: "Login to access and manage your team and operations with ease.",
        image: image1,
    },
    {
        title: "Use our inspect mode to inspect your IT assets",
        subtitle: "Inspect mode allows you to inspect your IT assets in detail",
        image: image2,
    },
    {
        title: "Get notified about your IT assets",
        subtitle: "Get real-time notifications about your IT assets",
        image: image3,
    }
];

const Slide = ({ imageSrc, title, subtitle }) => (
    <div className="relative w-full rounded-4xl overflow-hidden">
        <div className="inset-0 bg-black/50 rounded-4xl absolute"></div>
        <img src={imageSrc} alt={title} className="w-full h-screen object-cover" />

        <div className="absolute bottom-5 left-5 right-5 text-white">
            <h3 className="text-4xl font-semibold drop-shadow-lg">{title}</h3>
            <p className="drop-shadow-lg">{subtitle}</p>
        </div>
    </div>
);

const Carousel = ({ autoPlay = true, activeSlideDuration = 5000 }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const autoSlide = useRef(null);

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) =>
            prev + 1 === slides.length ? 0 : prev + 1
        );
    }, []);

    const prevSlide = () => {
        setActiveIndex((prev) =>
            prev - 1 < 0 ? slides.length - 1 : prev - 1
        );
    };

    useEffect(() => {
        if (!autoPlay) return;
        autoSlide.current = setInterval(nextSlide, activeSlideDuration);
        return () => clearInterval(autoSlide.current);
    }, [autoPlay, nextSlide, activeSlideDuration]);

    return (
        <div className="relative w-8/8 overflow-hidden">
            <div className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {slides.map((slide, i) => (
                    <div key={i} className="w-full shrink-0">
                        <Slide imageSrc={slide.image} title={slide.title} subtitle={slide.subtitle} />
                    </div>
                ))}
            </div>

            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black">
                ❮
            </button>

            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black">
                ❯
            </button>

            <div className="absolute bottom-3 w-full flex justify-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-2 w-2 rounded-full transition-all ${activeIndex === i ? "bg-white scale-125" : "bg-white/50"}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;