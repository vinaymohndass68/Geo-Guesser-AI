import React, { useState, useCallback } from 'react';
import { identifyLocationFromImage, LocationData, sendFollowUpMessage, ChatMessage, AnalysisOptions } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultDisplay } from './components/ResultDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { FollowUpChat } from './components/FollowUpChat';
import { ImageCropper } from './components/ImageCropper';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [locationResult, setLocationResult] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localityHint, setLocalityHint] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState<boolean>(false);
  
  const [options, setOptions] = useState<AnalysisOptions>({
    architecture: true,
    history: true,
    poi: true
  });

  const handleOriginalImageSelect = useCallback((file: File | null) => {
    setLocationResult(null);
    setError(null);
    setChatHistory([]);
    setImageFile(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    setImageToCrop(file);
  }, [imageUrl]);

  const handleCropConfirm = useCallback((croppedFile: File) => {
    setImageFile(croppedFile);
    const newImageUrl = URL.createObjectURL(croppedFile);
    setImageUrl(newImageUrl);
    setImageToCrop(null);
  }, []);

  const handleCropCancel = useCallback(() => {
    setImageToCrop(null);
  }, []);

  const handleIdentifyLocation = useCallback(async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLocationResult(null);
    setChatHistory([]);

    try {
      const result = await identifyLocationFromImage(imageFile, localityHint, options);
      setLocationResult(result);
    } catch (err) {
      console.error(err);
      setError("Could not identify the location. The AI model might be unavailable or the image could not be processed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, localityHint, options]);

  const handleFollowUpSubmit = useCallback(async (prompt: string) => {
    if (!locationResult) return;

    setIsSendingFollowUp(true);
    
    const newUserMessage: ChatMessage = { role: 'user', text: prompt };
    const currentChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(currentChatHistory);

    try {
        const responseText = await sendFollowUpMessage(locationResult, prompt, chatHistory);
        const newModelMessage: ChatMessage = { role: 'model', text: responseText };
        setChatHistory([...currentChatHistory, newModelMessage]);
    } catch (err) {
        console.error(err);
        const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I couldn't get a response. Please try again." };
        setChatHistory([...currentChatHistory, errorMessage]);
    } finally {
        setIsSendingFollowUp(false);
    }
  }, [locationResult, chatHistory]);

  const toggleOption = (key: keyof AnalysisOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 font-sans bg-slate-900 selection:bg-cyan-500/30">
      {imageToCrop && (
        <ImageCropper 
          imageFile={imageToCrop}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <main className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 md:p-12 w-full max-w-6xl transition-all duration-500 border border-slate-700/50">
        <Header />
        
        <div className="mt-10">
          <ImageUploader 
            onImageSelect={handleOriginalImageSelect}
            imageUrl={imageUrl} 
            disabled={isLoading || !!imageToCrop}
          />
        </div>

        {imageFile && (
          <div className="animate-fade-in">
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label htmlFor="locality-hint" className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-cyan-500 transition-colors">
                  Locality Context
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="locality-hint"
                    value={localityHint}
                    onChange={(e) => setLocalityHint(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g., District 1, Saigon"
                    className="w-full bg-slate-900/40 border border-slate-700/50 text-white rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 placeholder:text-slate-600"
                    aria-label="Locality Hint"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                  Analysis Parameters
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => toggleOption('architecture')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all border ${
                      options.architecture 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10' 
                        : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    Architectural Analysis
                  </button>
                  <button
                    onClick={() => toggleOption('history')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all border ${
                      options.history 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10' 
                        : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    Historical Context
                  </button>
                  <button
                    onClick={() => toggleOption('poi')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all border ${
                      options.poi 
                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/10' 
                        : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    Point of Interests
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <button
                onClick={handleIdentifyLocation}
                disabled={isLoading || !imageFile}
                className="group relative w-full md:w-auto bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black py-5 px-16 rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span className="relative">Processing Data...</span>
                  </>
                ) : (
                  <span className="relative">Run Discovery</span>
                )}
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-12 min-h-[50px]">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          {locationResult && imageUrl && !isLoading && (
            <ResultDisplay 
              imageUrl={imageUrl} 
              locationData={locationResult} 
            />
          )}
        </div>

        {locationResult && !isLoading && (
          <FollowUpChat
            chatHistory={chatHistory}
            onSendMessage={handleFollowUpSubmit}
            isLoading={isSendingFollowUp}
          />
        )}
      </main>
      <footer className="text-center mt-12 text-slate-600 text-sm font-medium tracking-wide">
        <p>Geo Guesser Pro &bull; Powered by Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
};

export default App;