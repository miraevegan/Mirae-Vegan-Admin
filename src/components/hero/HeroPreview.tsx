"use client";

import Image from "next/image";

type Props = {
    files: File[];
    mediaType: "image" | "video";
};

export default function HeroPreview({ files, mediaType }: Props) {
    if (files.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => {
                const url = URL.createObjectURL(file);

                return (
                    <div
                        key={index}
                        className="relative aspect-video bg-gray-100 rounded overflow-hidden"
                    >
                        {mediaType === "image" ? (
                            <Image
                                height={540}
                                width={990}
                                src={url}
                                alt="preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <video
                                src={url}
                                muted
                                autoPlay
                                loop
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
