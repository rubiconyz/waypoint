import React, { useState } from 'react';
import { generateVisionBoardImage } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';
import { Image as ImageIcon, Loader2, Download, AlertCircle } from 'lucide-react';

export const VisionBoard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio_1_1);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.Size_1K);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateVisionBoardImage(prompt, imageSize, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="text-blue-600" />
            Vision Board Generator
          </h2>
          <p className="text-gray-600 mt-2">
            Visualize your success. Describe your goal, select a format, and let AI create your motivation.
          </p>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to visualize?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A peaceful zen garden with morning sunlight, hyper realistic..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.values(AspectRatio).map((ratio) => (
                      <option key={ratio as string} value={ratio as string}>{ratio as string}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.values(ImageSize).map((size) => (
                      <option key={size as string} value={size as string}>{size as string}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${isLoading || !prompt.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Visualization
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Uses Gemini 3 Pro (Nano Banana Pro) Image Preview
                </p>
              </div>
            </form>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex flex-col h-full min-h-[400px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <div className={`flex-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group ${!generatedImage ? 'p-8' : ''
              }`}>
              {generatedImage ? (
                <>
                  <img
                    src={generatedImage}
                    alt="Generated Vision Board"
                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <a
                      href={generatedImage}
                      download={`vision-board-${Date.now()}.png`}
                      className="p-3 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
                      title="Download Image"
                    >
                      <Download size={24} />
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                      <p>Creating your masterpiece...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
                      <p>Your visualization will appear here</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};