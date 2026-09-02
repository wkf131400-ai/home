import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, ZoomIn, RefreshCw } from 'lucide-react';

interface FloorPlanViewerProps {
  imageUrl: string | null;
  onImageUpload: (fileUrl: string) => void;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  imageUrl,
  onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-slate-700 shrink-0" />
          <h3 className="text-xs font-bold text-slate-900">
            上传/预览户型图
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-3 h-3 text-slate-700" />
            <span>{imageUrl ? '更换户型图' : '上传图纸图片'}</span>
          </button>

          {imageUrl && (
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
              title="放大查看"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      {imageUrl ? (
        <div className="relative w-full h-[220px] sm:h-[260px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-1">
          <img
            src={imageUrl}
            alt="Uploaded floorplan"
            className="w-full h-full object-contain select-none rounded-lg"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl bg-slate-50 hover:bg-slate-100/80 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-2">
            <Upload className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-xs font-bold text-slate-800">点击上传自家户型图图片 (JPG/PNG/WEBP)</p>
          <p className="text-[10px] text-slate-400 mt-0.5">上传后可直接用于算量参考与后期设备规划</p>
        </div>
      )}

      {/* Lightbox modal for enlarged floor plan */}
      {isLightboxOpen && imageUrl && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-auto rounded-2xl bg-white border border-slate-200 p-2 shadow-2xl">
            <img src={imageUrl} alt="Enlarged floor plan" className="w-full h-auto object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 bg-slate-900 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

