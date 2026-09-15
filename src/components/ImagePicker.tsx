import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Link as LinkIcon, Trash2, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { compressAndResizeImage, captureVideoFrame } from '../utils/imageProcessor';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [mode, setMode] = useState<'preview' | 'live_camera' | 'url_input'>('preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState(value);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount or mode switch
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Handle file selection (from tablet gallery or files)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const compressedDataUrl = await compressAndResizeImage(file);
      onChange(compressedDataUrl);
      setMode('preview');
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Не удалось обработать изображение. Попробуйте еще раз.');
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  // Start in-browser live camera viewfinder
  const startLiveCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setCapturedSnapshot(null);
    setMode('live_camera');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Камера не поддерживается браузером');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Live camera error:', err);
      // If live camera is blocked in iframe or device permission denied, fallback to native camera input
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Доступ к камере отклонен. Вы можете использовать кнопку «Снять на камеру» ниже для открытия системной камеры.'
          : 'Не удалось запустить видеопоток камеры. Используйте кнопку системной камеры ниже.'
      );
    }
  };

  // Switch between front and back cameras
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Take snapshot from live video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const snapshotUrl = captureVideoFrame(videoRef.current);
      setCapturedSnapshot(snapshotUrl);
    } catch (err) {
      console.error('Snapshot error:', err);
    }
  };

  // Accept captured snapshot
  const applySnapshot = () => {
    if (capturedSnapshot) {
      onChange(capturedSnapshot);
      stopCameraStream();
      setCapturedSnapshot(null);
      setMode('preview');
    }
  };

  // Retake photo
  const retakeSnapshot = () => {
    setCapturedSnapshot(null);
  };

  // Close live camera
  const closeLiveCamera = () => {
    stopCameraStream();
    setCapturedSnapshot(null);
    setCameraError(null);
    setMode('preview');
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs for native file picker and camera capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mode 1: Normal Preview & Action Buttons */}
      {mode === 'preview' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-stone-700 uppercase tracking-wider">
              Фотография блюда
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Сбросить фото
              </button>
            )}
          </div>

          {/* Image Display Area */}
          <div className="relative aspect-[4/3] w-full max-w-md mx-auto bg-stone-100 rounded-2xl overflow-hidden border-2 border-dashed border-stone-300 flex flex-col items-center justify-center group">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
                <p className="text-sm font-bold text-stone-700">Оптимизация и сжатие фото...</p>
                <p className="text-xs text-stone-400">Подгоняем размер под экран планшета</p>
              </div>
            ) : value ? (
              <>
                <img
                  src={value}
                  alt="Предпросмотр блюда"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-white text-stone-800 rounded-xl text-xs font-bold shadow-md hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" /> Заменить
                  </button>
                  <button
                    type="button"
                    onClick={() => startLiveCamera()}
                    className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Снять заново
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-stone-200 flex items-center justify-center text-stone-400 mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-stone-700">Фотография еще не добавлена</p>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Сделайте снимок на камеру планшета или выберите файл из галереи
                </p>
              </div>
            )}
          </div>

          {/* Main Action Buttons (Optimized for Touch/Tablet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {/* Direct Camera Button (Opens native camera on tablets/phones or live webcam) */}
            <button
              type="button"
              onClick={() => {
                // Try live viewfinder first; if on touch device with camera support, can also offer native
                startLiveCamera();
              }}
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Сделать фото камерой</span>
            </button>

            {/* Gallery / File Picker Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-sm border border-stone-200 active:scale-95 transition-all"
            >
              <Upload className="w-5 h-5 text-stone-600" />
              <span>Загрузить из галереи</span>
            </button>
          </div>

          {/* Secondary Options */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" /> Системная камера устройства
            </button>

            <button
              type="button"
              onClick={() => {
                setUrlDraft(value);
                setMode('url_input');
              }}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Указать ссылку (URL)
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Live Viewfinder / Snapshot Camera */}
      {mode === 'live_camera' && (
        <div className="bg-stone-900 rounded-3xl p-4 sm:p-6 text-white relative shadow-2xl overflow-hidden border border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold tracking-wide">
                {capturedSnapshot ? 'Проверьте полученный снимок' : 'Камера планшета (Видоискатель)'}
              </span>
            </div>

            <button
              type="button"
              onClick={closeLiveCamera}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cameraError ? (
            <div className="p-6 bg-stone-800/80 rounded-2xl border border-stone-700 text-center space-y-4 my-2">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-sm text-stone-300 max-w-md mx-auto">{cameraError}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  Открыть камеру устройства
                </button>
                <button
                  type="button"
                  onClick={closeLiveCamera}
                  className="px-4 py-2.5 bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-600 transition-colors"
                >
                  Вернуться назад
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Viewfinder or Frozen Snapshot */}
              <div className="relative aspect-[4/3] w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden shadow-inner border border-stone-800">
                {capturedSnapshot ? (
                  <img
                    src={capturedSnapshot}
                    alt="Снимок"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* Framing Guidelines Grid */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-white" />
                      <div className="border-r border-white" />
                      <div />
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between max-w-lg mx-auto px-2">
                {capturedSnapshot ? (
                  <div className="flex items-center justify-between w-full gap-3">
                    <button
                      type="button"
                      onClick={retakeSnapshot}
                      className="flex-1 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Переснять
                    </button>
                    <button
                      type="button"
                      onClick={applySnapshot}
                      className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Использовать фото
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    {/* Switch camera front/back */}
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-3 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-300 hover:text-white transition-colors"
                      title="Переключить камеру"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-95 shadow-xl transition-all flex items-center justify-center"
                      title="Сделать снимок"
                    >
                      <div className="w-11 h-11 rounded-full bg-white/20" />
                    </button>

                    {/* Cancel */}
                    <button
                      type="button"
                      onClick={closeLiveCamera}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 3: Manual URL Input */}
      {mode === 'url_input' && (
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Вставить прямую ссылку на фото
            </label>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Отмена
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://..."
              className="flex-1 p-3 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
            />
            <button
              type="button"
              onClick={() => {
                onChange(urlDraft.trim());
                setMode('preview');
              }}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
