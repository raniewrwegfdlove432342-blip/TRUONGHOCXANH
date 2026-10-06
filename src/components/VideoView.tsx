import React, { useState } from 'react';
import {
  Video as VideoIcon,
  Play,
  Clock,
  ExternalLink,
  Shield,
  Sparkles,
  Share2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { EducationalVideo } from '../types';
import { EDUCATIONAL_VIDEOS } from '../data/mockData';

export const VideoView: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<EducationalVideo>(EDUCATIONAL_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <section className="bg-linear-to-r from-orange-600 to-rose-600 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <VideoIcon className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-orange-200 tracking-wider">
              THƯ VIỆN PHÓNG SỰ & KỸ NĂNG SỐNG
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              Thư Viện Video Tuyên Truyền & Cảnh Báo
            </h2>
          </div>
        </div>
        <p className="text-xs text-orange-100">
          Nguồn tư liệu chính thống từ Truyền hình Công an Nhân dân (ANTV), Kênh Giáo dục VTV7 và Dự án Trường Học An Toàn.
        </p>
      </section>

      {/* Featured Video Player Mockup */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group shadow-md">
          <img
            src={selectedVideo.thumbnailUrl}
            alt={selectedVideo.title}
            className={`w-full h-full object-cover transition duration-300 ${
              isPlaying ? 'blur-xs scale-105' : 'group-hover:scale-105'
            }`}
          />

          {!isPlaying ? (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition"
              >
                <Play className="w-8 h-8 fill-white ml-1" />
              </button>
              <div className="mt-3 text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                Thời lượng: {selectedVideo.duration}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
                <Play className="w-6 h-6 fill-emerald-400" />
              </div>
              <h4 className="text-sm font-bold max-w-md">{selectedVideo.title}</h4>
              <p className="text-xs text-slate-300 max-w-sm italic">
                (Đang phát sóng mô phỏng tư liệu tuyên truyền học đường)
              </p>
              <button
                onClick={() => setIsPlaying(false)}
                className="px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold backdrop-blur-xs transition"
              >
                Tạm dừng phát
              </button>
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
            CẢNH BÁO KHẨN
          </div>
        </div>

        {/* Video Info */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-bold text-blue-600">{selectedVideo.source}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {selectedVideo.duration}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
            {selectedVideo.title}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {selectedVideo.description}
          </p>

          <div className="mt-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900">Bài học cốt lõi: </span>
              <span>{selectedVideo.keyTakeaway}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 uppercase">
          DANH SÁCH VIDEO TUYÊN TRUYỀN KHÁC
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EDUCATIONAL_VIDEOS.map((vid) => (
            <div
              key={vid.id}
              onClick={() => {
                setSelectedVideo(vid);
                setIsPlaying(false);
              }}
              className={`p-3 rounded-2xl border transition cursor-pointer flex gap-3 ${
                selectedVideo.id === vid.id
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-300/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-24 h-16 rounded-xl overflow-hidden relative shrink-0">
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded-sm">
                  {vid.duration}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-blue-600 truncate">{vid.source}</div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                  {vid.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
