"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Image from "next/image";

type Hero = {
    mediaType: "image" | "video";
    media: { url: string }[];
};

export default function ActiveHeroCard() {
    const [hero, setHero] = useState<Hero | null>(null);

    useEffect(() => {
        api.get("/hero").then((res) => setHero(res.data));
    }, []);

    if (!hero) {
        return (
            <div className="border p-6 rounded-lg text-gray-500">
                No active hero
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium">Active Hero</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hero.media.map((item, index) => (
                    <div
                        key={index}
                        className="aspect-video bg-black rounded overflow-hidden"
                    >
                        {hero.mediaType === "image" ? (
                            <Image
                                height={540}
                                width={990}
                                alt="Hero Image"
                                src={item.url}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <video
                                src={item.url}
                                muted
                                autoPlay
                                loop
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
