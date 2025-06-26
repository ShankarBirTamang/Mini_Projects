import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { ShareIcon, ClipboardIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const GratitudeCard = () => {
  const [message, setMessage] = useState('');
  const cardRef = useRef(null);

  const downloadCard = async () => {
    try {
      // Wait longer to ensure all fonts and styles are fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a reflow to ensure all text is properly rendered
      cardRef.current.offsetHeight;
      
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'transparent',
        cacheBust: true,
        includeQueryParams: true,
        skipAutoScale: true,
        useCORS: true,
        allowTaint: true,
        filter: () => {
          return true;
        },
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: cardRef.current.offsetWidth + 'px',
          height: cardRef.current.offsetHeight + 'px',
          fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
          lineHeight: '1.625',
          letterSpacing: 'normal',
        }
      });
      
      const link = document.createElement('a');
      link.download = 'gratitude-card.png';
      link.href = dataUrl;
      link.click();
      toast.success('Card downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download card');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard!');
    } catch {
      toast.error('Failed to copy message');
    }
  };

  const shareCard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Gratitude Card',
          text: message,
        });
        toast.success('Card shared successfully!');
      } else {
        await copyToClipboard();
      }
    } catch {
      toast.error('Failed to share card');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Side-by-side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side - Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Write Your Gratitude Message
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your heartfelt gratitude message here... Share what you're thankful for, express appreciation to someone special, or simply reflect on the good things in your life."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-64 text-gray-700 placeholder-gray-400 leading-relaxed"
            />
            <div className="mt-4 text-sm text-gray-500">
              <p>💡 Tip: Your message will appear in real-time on the card preview</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Share Your Gratitude
            </h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyToClipboard}
                disabled={!message}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                <ClipboardIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Copy Text</span>
              </button>
              <button
                onClick={downloadCard}
                disabled={!message}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Download Card</span>
              </button>
              <button
                onClick={shareCard}
                disabled={!message}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Card Preview */}
        <div className="space-y-4">
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Card Preview
            </h3>
            <p className="text-gray-600">
              See how your gratitude card will look
            </p>
          </div>

          {/* Portrait Gratitude Card */}
          <div className="flex justify-center lg:justify-start">
            <div 
              ref={cardRef} 
              className="relative w-80 aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 border border-white/20"
              style={{ minHeight: '400px' }}
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-30"></div>
                <div className="absolute bottom-8 left-6 w-12 h-12 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-25"></div>
                <div className="absolute top-1/3 left-4 w-8 h-8 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-20"></div>
              </div>

              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between p-8">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                    Gratitude
                  </h2>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
                </div>

                {/* Message Content */}
                <div className="flex-1 flex items-center justify-center px-2">
                  {message ? (
                    <div className="text-center">
                      <p className="text-gray-700 text-lg font-serif leading-relaxed whitespace-pre-wrap text-center break-words" style={{ 
                        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        lineHeight: '1.625',
                        letterSpacing: 'normal',
                        wordBreak: 'break-word',
                        hyphens: 'auto'
                      }}>
                        "{message}"
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 text-lg font-serif italic text-center" style={{ 
                        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        lineHeight: '1.625',
                        letterSpacing: 'normal'
                      }}>
                        Your beautiful gratitude message will appear here...
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 font-medium">
                    With Love & Appreciation
                  </p>
                </div>
              </div>

              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                                   radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="bottom-center" />
    </div>
  );
};

export default GratitudeCard; 