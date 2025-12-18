
import React, { useState, useEffect } from 'react';
import { 
  AppStep, 
  PostingData, 
  GeneratedContent, 
  Language, 
  AppSettings, 
  FBPage,
  PostingReport 
} from './types';
import { getSettings, saveSettings, saveReport } from './services/dbService';
import { generateKushtiContent } from './services/geminiService';
import { KUSHTI_KEYWORDS, ICONS } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.INPUT);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [postingData, setPostingData] = useState<PostingData>({
    videoFile: null,
    primaryKeyword: '',
    language: Language.MARATHI
  });
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [postingStatus, setPostingStatus] = useState({
    youtube: false,
    facebook: false,
    instagram: false,
    whatsapp: false
  });

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleStartGeneration = async () => {
    if (!postingData.primaryKeyword) {
      alert("Please enter a keyword!");
      return;
    }
    setIsLoading(true);
    setCurrentStep(AppStep.GENERATING);
    try {
      const content = await generateKushtiContent(postingData);
      setGenerated(content);
      setCurrentStep(AppStep.YOUTUBE);
    } catch (error) {
      console.error(error);
      alert("Failed to generate content. Check API Key or Internet.");
      setCurrentStep(AppStep.INPUT);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const navigateToStep = (step: AppStep) => {
    if (step === AppStep.FACEBOOK && !settings.selectedFBPage) {
      setCurrentStep(AppStep.SETTINGS);
      alert("Please select or add a Facebook Page first!");
      return;
    }
    setCurrentStep(step);
  };

  const finalizeReport = () => {
    const report: PostingReport = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      keyword: postingData.primaryKeyword,
      title: generated?.youtube.title || "Untitled",
      fbPage: settings.selectedFBPage?.name || "N/A",
      status: postingStatus
    };
    saveReport(report);
    setCurrentStep(AppStep.REPORT);
  };

  const resetFlow = () => {
    setPostingData({
      videoFile: null,
      primaryKeyword: '',
      language: Language.MARATHI
    });
    setPostingStatus({
      youtube: false,
      facebook: false,
      instagram: false,
      whatsapp: false
    });
    setGenerated(null);
    setCurrentStep(AppStep.INPUT);
  };

  // Rendering Helper Components
  const StepHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-3 bg-amber-600 rounded-lg text-white">{icon}</div>
      <h2 className="text-3xl font-bold teko text-amber-500">{title}</h2>
    </div>
  );

  const CopyableItem = ({ label, value, isTags = false }: { label: string; value: string; isTags?: boolean }) => (
    <div className="bg-stone-800 p-4 rounded-lg border border-stone-700 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase font-bold text-stone-500">{label}</span>
        <button 
          onClick={() => copyToClipboard(value)}
          className="text-amber-500 text-xs hover:underline flex items-center"
        >
          Copy {isTags ? "Plain Tags" : "Text"}
        </button>
      </div>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen mitti-gradient p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-2xl mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center font-bold text-xl">K</div>
          <h1 className="text-2xl font-bold tracking-wider">Kushti Assistant</h1>
        </div>
        <button 
          onClick={() => setCurrentStep(AppStep.SETTINGS)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          ⚙️
        </button>
      </header>

      <main className="w-full max-w-2xl bg-stone-900/50 backdrop-blur-sm rounded-2xl border border-stone-700 p-6 shadow-2xl">
        {/* STEP: INPUT */}
        {currentStep === AppStep.INPUT && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold teko text-amber-500">New Post Details</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Primary Keyword (Kushti Related)</label>
              <select 
                value={postingData.primaryKeyword}
                onChange={(e) => setPostingData({...postingData, primaryKeyword: e.target.value})}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select Keyword</option>
                {KUSHTI_KEYWORDS.map(k => <option key={k} value={k}>{k}</option>)}
                <option value="custom">Custom...</option>
              </select>
              {postingData.primaryKeyword === 'custom' && (
                <input 
                  type="text" 
                  placeholder="Enter custom keyword..."
                  className="w-full mt-2 bg-stone-800 border border-stone-700 rounded-lg p-3 text-white"
                  onChange={(e) => setPostingData({...postingData, primaryKeyword: e.target.value})}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pune, Kolhapur"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white"
                  value={postingData.location}
                  onChange={(e) => setPostingData({...postingData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Language</label>
                <select 
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white"
                  value={postingData.language}
                  onChange={(e) => setPostingData({...postingData, language: e.target.value as Language})}
                >
                  <option value={Language.MARATHI}>Marathi</option>
                  <option value={Language.HINDI}>Hindi</option>
                  <option value={Language.ENGLISH}>English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Video File</label>
              <input 
                type="file" 
                accept="video/*"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-400 file:bg-amber-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 cursor-pointer"
                onChange={(e) => setPostingData({...postingData, videoFile: e.target.files?.[0] || null})}
              />
            </div>

            <button 
              onClick={handleStartGeneration}
              className="w-full py-4 bg-amber-600 rounded-xl font-bold text-lg uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-lg"
            >
              Generate Content 🚀
            </button>
          </div>
        )}

        {/* STEP: GENERATING */}
        {currentStep === AppStep.GENERATING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl teko text-amber-500 animate-pulse">Sharpening the wrestling techniques... (Generating AI Content)</p>
          </div>
        )}

        {/* STEP: YOUTUBE */}
        {currentStep === AppStep.YOUTUBE && generated && (
          <div>
            <StepHeader title="Step 1: YouTube Shorts" icon={<ICONS.YouTube />} />
            <div className="space-y-4">
              <div className="bg-amber-900/20 p-3 rounded border border-amber-600/30 text-sm text-amber-200">
                💡 <b>Guide:</b> 1. Open Studio. 2. Upload Video. 3. Paste Title/Desc. 4. Open "Tags" & paste the plain text tags.
              </div>
              <CopyableItem label="SEO Title" value={generated.youtube.title!} />
              <CopyableItem label="Description" value={generated.youtube.description!} />
              <CopyableItem label="Plain Tags (No Hash)" value={generated.youtube.tags!.join(', ')} isTags />
              
              <div className="flex items-center space-x-2 py-4">
                <input 
                  type="checkbox" 
                  id="yt-done" 
                  checked={postingStatus.youtube}
                  onChange={(e) => setPostingStatus({...postingStatus, youtube: e.target.checked})}
                  className="w-5 h-5 accent-amber-600"
                />
                <label htmlFor="yt-done" className="text-stone-300">I have published the YouTube Short</label>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => window.open('https://studio.youtube.com', '_blank')}
                  className="flex-1 py-3 bg-red-700 rounded-lg font-bold hover:bg-red-800"
                >
                  Open YouTube Studio
                </button>
                <button 
                  onClick={() => navigateToStep(AppStep.FACEBOOK)}
                  className="flex-1 py-3 bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
                >
                  Next: Facebook Reels →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: FACEBOOK */}
        {currentStep === AppStep.FACEBOOK && generated && (
          <div>
            <StepHeader title={`Step 2: FB Reels (${settings.selectedFBPage?.name})`} icon={<ICONS.Facebook />} />
            <div className="space-y-4">
              <CopyableItem label="Caption" value={generated.facebook.caption!} />
              <CopyableItem label="Hashtags" value={generated.facebook.hashtags!.join(' ')} />
              
              <div className="flex items-center space-x-2 py-4">
                <input 
                  type="checkbox" 
                  id="fb-done" 
                  checked={postingStatus.facebook}
                  onChange={(e) => setPostingStatus({...postingStatus, facebook: e.target.checked})}
                  className="w-5 h-5 accent-amber-600"
                />
                <label htmlFor="fb-done" className="text-stone-300">Published to {settings.selectedFBPage?.name}</label>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => window.open(`https://www.facebook.com/${settings.selectedFBPage?.id}/reels_hub`, '_blank')}
                  className="flex-1 py-3 bg-blue-700 rounded-lg font-bold hover:bg-blue-800"
                >
                  Open FB Page Reels
                </button>
                <button 
                  onClick={() => navigateToStep(AppStep.INSTAGRAM)}
                  className="flex-1 py-3 bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
                >
                  Next: Instagram →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: INSTAGRAM */}
        {currentStep === AppStep.INSTAGRAM && generated && (
          <div>
            <StepHeader title="Step 3: Instagram Reels" icon={<ICONS.Instagram />} />
            <div className="space-y-4">
              <CopyableItem label="Reel Caption" value={generated.instagram.caption!} />
              <CopyableItem label="Hashtags (SEO Optimized)" value={generated.instagram.hashtags!.join(' ')} />
              
              <div className="flex items-center space-x-2 py-4">
                <input 
                  type="checkbox" 
                  id="ig-done" 
                  checked={postingStatus.instagram}
                  onChange={(e) => setPostingStatus({...postingStatus, instagram: e.target.checked})}
                  className="w-5 h-5 accent-amber-600"
                />
                <label htmlFor="ig-done" className="text-stone-300">I have published on Instagram</label>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => window.open('https://www.instagram.com/reels/create/', '_blank')}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:opacity-90"
                >
                  Open Instagram
                </button>
                <button 
                  onClick={() => navigateToStep(AppStep.WHATSAPP)}
                  className="flex-1 py-3 bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
                >
                  Next: WhatsApp →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: WHATSAPP */}
        {currentStep === AppStep.WHATSAPP && generated && (
          <div>
            <StepHeader title="Step 4: WhatsApp Share" icon={<ICONS.WhatsApp />} />
            <div className="space-y-4">
              <CopyableItem label="Status Text (Short)" value={generated.whatsapp.statusText!} />
              <CopyableItem label="Channel Post (Detailed)" value={generated.whatsapp.channelText!} />
              
              <div className="flex items-center space-x-2 py-4">
                <input 
                  type="checkbox" 
                  id="wa-done" 
                  checked={postingStatus.whatsapp}
                  onChange={(e) => setPostingStatus({...postingStatus, whatsapp: e.target.checked})}
                  className="w-5 h-5 accent-amber-600"
                />
                <label htmlFor="wa-done" className="text-stone-300">Shared to Status & Channel</label>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                  className="flex-1 py-3 bg-green-700 rounded-lg font-bold hover:bg-green-800"
                >
                  Open WhatsApp Web
                </button>
                <button 
                  onClick={finalizeReport}
                  className="flex-1 py-3 bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
                >
                  Finish & Report 🏁
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: REPORT */}
        {currentStep === AppStep.REPORT && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold teko text-amber-500 border-b border-stone-700 pb-2">Posting Summary ✔️</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-stone-800 rounded">
                <span className="flex items-center space-x-2"><ICONS.YouTube /> <span>YouTube Shorts</span></span>
                {postingStatus.youtube ? <ICONS.Check /> : <ICONS.Pending />}
              </div>
              <div className="flex justify-between items-center p-3 bg-stone-800 rounded">
                <span className="flex items-center space-x-2"><ICONS.Facebook /> <span>Facebook ({settings.selectedFBPage?.name})</span></span>
                {postingStatus.facebook ? <ICONS.Check /> : <ICONS.Pending />}
              </div>
              <div className="flex justify-between items-center p-3 bg-stone-800 rounded">
                <span className="flex items-center space-x-2"><ICONS.Instagram /> <span>Instagram Reels</span></span>
                {postingStatus.instagram ? <ICONS.Check /> : <ICONS.Pending />}
              </div>
              <div className="flex justify-between items-center p-3 bg-stone-800 rounded">
                <span className="flex items-center space-x-2"><ICONS.WhatsApp /> <span>WhatsApp</span></span>
                {postingStatus.whatsapp ? <ICONS.Check /> : <ICONS.Pending />}
              </div>
            </div>

            <div className="bg-stone-800 p-4 rounded-lg text-sm text-stone-400">
              <p><b>Date:</b> {new Date().toLocaleDateString()}</p>
              <p><b>Video Title:</b> {generated?.youtube.title}</p>
              <p><b>Keyword:</b> {postingData.primaryKeyword}</p>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => copyToClipboard(`Posting Report: ${generated?.youtube.title}\nYouTube: ${postingStatus.youtube}\nFB: ${postingStatus.facebook}\nIG: ${postingStatus.instagram}\nWA: ${postingStatus.whatsapp}`)}
                className="flex-1 py-3 bg-stone-700 rounded-lg font-bold hover:bg-stone-600"
              >
                Copy Report Text
              </button>
              <button 
                onClick={resetFlow}
                className="flex-1 py-3 bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
              >
                Start New Post
              </button>
            </div>
          </div>
        )}

        {/* STEP: SETTINGS */}
        {currentStep === AppStep.SETTINGS && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold teko text-amber-500">Settings</h2>
              <button onClick={() => setCurrentStep(AppStep.INPUT)} className="text-stone-500">Close</button>
            </div>

            <section>
              <h3 className="font-bold mb-3 text-stone-400 uppercase text-xs">Facebook Page Configuration</h3>
              <div className="space-y-3">
                {settings.selectedFBPage && (
                  <div className="bg-amber-900/20 p-3 rounded border border-amber-600/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-amber-500">{settings.selectedFBPage.name}</p>
                      <p className="text-xs text-stone-500">ID: {settings.selectedFBPage.id}</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, selectedFBPage: null})}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {!settings.selectedFBPage && (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-500 italic">No page selected. Add your Page Details manually:</p>
                    <input 
                      type="text" 
                      placeholder="Facebook Page Name" 
                      className="w-full bg-stone-800 border border-stone-700 rounded p-2"
                      id="fb-name-input"
                    />
                    <input 
                      type="text" 
                      placeholder="Facebook Page ID (found in Page About)" 
                      className="w-full bg-stone-800 border border-stone-700 rounded p-2"
                      id="fb-id-input"
                    />
                    <button 
                      onClick={() => {
                        const name = (document.getElementById('fb-name-input') as HTMLInputElement).value;
                        const id = (document.getElementById('fb-id-input') as HTMLInputElement).value;
                        if (name && id) setSettings({...settings, selectedFBPage: { name, id }});
                      }}
                      className="w-full py-2 bg-amber-600 rounded font-bold"
                    >
                      Save Page
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="font-bold mb-3 text-stone-400 uppercase text-xs">Default Posting Footer</h3>
              <textarea 
                className="w-full bg-stone-800 border border-stone-700 rounded p-3 h-24 text-sm"
                value={settings.defaultFooter}
                onChange={(e) => setSettings({...settings, defaultFooter: e.target.value})}
              />
            </section>

            <div className="pt-6 border-t border-stone-800">
               <p className="text-[10px] text-stone-600 text-center">
                 Personal Use Only • PWA 1.0 • No Cloud Sync
               </p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-stone-600 text-xs text-center">
        Built for Kushti Pehelwans & Content Creators 🇮🇳
      </footer>
    </div>
  );
};

export default App;
