import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, PixelCrop } from 'react-image-crop';

// Helper to center the initial crop
function centerInitialCrop(mediaWidth: number, mediaHeight: number): Crop {
  return centerCrop(
    {
      unit: '%',
      width: 90,
      height: 90,
    },
    mediaWidth,
    mediaHeight
  );
}

// Function to convert canvas to a file
async function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File | null> {
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            if (!blob) {
                resolve(null);
                return;
            }
            resolve(new File([blob], fileName, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9); // Use high quality JPEG
    });
}

interface ImageCropperProps {
    imageFile: File;
    onConfirm: (file: File) => void;
    onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageFile, onConfirm, onCancel }) => {
    const [imgSrc, setImgSrc] = useState('');
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
        reader.readAsDataURL(imageFile);
    }, [imageFile]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerInitialCrop(width, height));
    }

    const rotateLeft = () => setRotation((prev) => (prev - 90) % 360);
    const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

    const handleConfirmCrop = async () => {
        if (!completedCrop || !imgRef.current) {
            console.error("Crop or image ref not available");
            return;
        }

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("Could not get canvas context");
            return;
        }

        // getBoundingClientRect gives the actual rendered (scaled) dimensions
        const rect = image.getBoundingClientRect();
        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;

        canvas.width = Math.floor(completedCrop.width * scaleX);
        canvas.height = Math.floor(completedCrop.height * scaleY);

        ctx.save();
        
        // Move to the center of the output canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Rotate the context
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Calculate image center in natural pixels
        const imgCenterX = image.naturalWidth / 2;
        const imgCenterY = image.naturalHeight / 2;
        
        // Calculate crop center in natural pixels
        const cropCenterX = (completedCrop.x + completedCrop.width / 2) * scaleX;
        const cropCenterY = (completedCrop.y + completedCrop.height / 2) * scaleY;
        
        // Offset from image center to crop center
        const offsetX = cropCenterX - imgCenterX;
        const offsetY = cropCenterY - imgCenterY;
        
        ctx.drawImage(
            image,
            -imgCenterX - offsetX,
            -imgCenterY - offsetY,
            image.naturalWidth,
            image.naturalHeight
        );

        ctx.restore();
        
        const croppedFile = await canvasToFile(canvas, imageFile.name);
        if(croppedFile) {
            onConfirm(croppedFile);
        } else {
            console.error("Failed to create cropped file.");
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 1));
    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseFloat(e.target.value));
    };

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-2 md:p-6 animate-fade-in backdrop-blur-xl">
            <div className="bg-slate-800/90 rounded-3xl shadow-2xl p-4 md:p-8 w-full max-w-5xl flex flex-col h-[95vh] border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Adjust Image View</h2>
                    <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-700/50">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zoom</span>
                        <div className="flex items-center gap-2">
                            <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <input 
                                type="range" min="1" max="3" step="0.05" value={zoom} onChange={handleZoomChange}
                                className="w-24 md:w-40 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <span className="text-xs font-mono text-cyan-400 w-8">{zoom.toFixed(1)}x</span>
                    </div>
                </div>
                
                <div className="flex-grow relative bg-slate-900/90 rounded-2xl overflow-auto custom-scrollbar border border-slate-700/50 flex items-start justify-center p-8">
                    {imgSrc && (
                        <div 
                            className="inline-block transition-transform duration-200"
                            style={{ 
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center'
                            }}
                        >
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                minWidth={40}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop target"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="max-h-[65vh] w-auto select-none"
                                    style={{ 
                                        transform: `rotate(${rotation}deg)`,
                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </ReactCrop>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex gap-3">
                        <button
                            onClick={rotateLeft}
                            className="bg-slate-700/80 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm border border-slate-600/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Rotate Left
                        </button>
                        <button
                            onClick={rotateRight}
                            className="bg-slate-700/80 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm border border-slate-600/50"
                        >
                            Rotate Right
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={onCancel}
                            className="flex-1 sm:flex-none text-slate-300 hover:text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmCrop}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                        >
                            Confirm Crop
                        </button>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                    border: 3px solid rgba(15, 23, 42, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}} />
        </div>
    );
};
