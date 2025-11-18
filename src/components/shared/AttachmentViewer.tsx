'use client';

import React, {useState} from 'react';
import Image from 'next/image';
import {FileText, Download, FileArchive} from 'lucide-react';
import clsx from "clsx";
import Spinner from "@/components/shared/Spinner"; // Giả định component Spinner có sẵn

interface Attachment {
    fileType: string;
    fileName: string;
    fileSize: number;
    secureUrl: string;
    downloadUrl?: string;
}

export default function AttachmentViewer({
                                             attachment,
                                         }: {
    attachment: Attachment;
}) {
    const {fileType, fileName, fileSize, secureUrl, downloadUrl} = attachment;

    // State để theo dõi trạng thái tải media
    const [mediaLoaded, setMediaLoaded] = useState(false);

    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');
    const isPDF = fileType === 'application/pdf';
    const isZip = fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z');
    const isDoc =
        fileType.includes('msword') ||
        fileType.includes('officedocument') ||
        fileType.includes('text/plain');

    const readableSize = (size: number) =>
        size < 1024
            ? `${size} B`
            : size < 1024 * 1024
                ? `${(size / 1024).toFixed(1)} KB`
                : `${(size / (1024 * 1024)).toFixed(1)} MB`;

    // Chiều cao cố định
    const MEDIA_HEIGHT_CLASS = "h-[320px] max-h-[320px]";
    const FILE_HEIGHT_CLASS = "h-[90px]";

    // Skeleton element (SỬA ĐỔI: Loại bỏ w-[600px] và dùng inset-0 để tự động full width/height)
    const MediaSkeleton = (
        <div
            className={clsx("flex items-center justify-center bg-gray-100 animate-pulse")}>
            <Spinner/>
        </div>
    );

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden max-w-md w-fit">

            {/* --- IMAGE VIEWER --- */}
            {isImage && (
                // Container cho Image cần phải có width cố định (w-fit) để Image tự căn giữa
                <div className={clsx("flex justify-center bg-white p-2 relative w-fit", MEDIA_HEIGHT_CLASS)}>

                    {!mediaLoaded && MediaSkeleton}

                    <Image
                        src={secureUrl}
                        alt={fileName}
                        width={600}
                        height={400}
                        onLoad={() => setMediaLoaded(true)}
                        className={clsx(
                            "h-full w-auto object-contain rounded transition-opacity duration-300",
                            !mediaLoaded && "opacity-0"
                        )}
                        priority={false}
                    />
                </div>
            )}

            {/* --- VIDEO VIEWER --- */}
            {isVideo && (
                // Container cho Video cần có width cố định (w-[600px]) hoặc một width tối đa hợp lý
                // để Video Skeleton có thể chiếm hết.
                // Điều chỉnh: Đặt width cứng cho container video (ví dụ: w-[500px] hoặc w-[600px] tùy ý bạn)
                // hoặc sử dụng w-full nếu nó nằm trong một container lớn hơn.
                // Nếu muốn min-width 500px, hãy đảm bảo container cha cũng đáp ứng được.
                <>
                    {!mediaLoaded && MediaSkeleton}
                    <div className={clsx("flex justify-center bg-black relative", MEDIA_HEIGHT_CLASS)}>
                        <video
                            controls
                            onLoadedMetadata={() => setMediaLoaded(true)}
                            className={clsx(
                                // Loại bỏ min-w-[500px] ở đây, video sẽ full width của container cha (w-[500px])
                                "h-full w-full rounded-lg object-contain transition-opacity duration-300",
                                !mediaLoaded && "opacity-0"
                            )}
                        >
                            <source src={secureUrl} type={fileType}/>
                            This browser does not support playing this video.
                        </video>
                    </div>
                </>
            )}

            {/* --- FILE VIEWER (PDF, DOC, ZIP) --- */}
            {(isPDF || isDoc || isZip) && (
                <div className={clsx("flex items-center gap-3 p-4 w-[320px] bg-white", FILE_HEIGHT_CLASS)}>
                    {isZip ? (
                        <FileArchive className="text-amber-500" size={28}/>
                    ) : (
                        <FileText className="text-blue-500" size={28}/>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{fileName}</p>
                        <p className="text-xs text-gray-500">{readableSize(fileSize)}</p>
                    </div>
                    <a
                        href={downloadUrl || secureUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <Download size={18} className="text-gray-600"/>
                    </a>
                </div>
            )}

            {/* --- OTHER FILE VIEWER --- */}
            {!isImage && !isVideo && !isPDF && !isDoc && !isZip && (
                <div className={clsx("flex items-center gap-3 p-4 w-[320px] bg-white", FILE_HEIGHT_CLASS)}>
                    <FileText className="text-gray-500" size={28}/>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{fileName}</p>
                        <p className="text-xs text-gray-500">{readableSize(fileSize)}</p>
                    </div>
                    {(downloadUrl || secureUrl) && (
                        <a
                            href={downloadUrl || secureUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <Download size={18} className="text-gray-600"/>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}