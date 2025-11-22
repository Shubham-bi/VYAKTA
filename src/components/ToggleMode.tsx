interface ToggleModeProps {
  mode: 'sign-to-speech' | 'speech-to-sign';
  onChange: (mode: 'sign-to-speech' | 'speech-to-sign') => void;
}

const ToggleMode = ({ mode, onChange }: ToggleModeProps) => {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1 border border-gray-200 shadow-md" role="group" aria-label="Translation Mode Toggle">
      <button
        type="button"
        aria-pressed={mode === 'speech-to-sign'}
        onClick={() => onChange('speech-to-sign')}
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          mode === 'speech-to-sign'
            ? 'bg-white text-blue-600 shadow-lg scale-105'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h3m4 0V7a2 2 0 00-2-2h-7a2 2 0 00-2 2v10a2 2 0 002 2h3" /></svg>
        Speech to Sign
      </button>
      <button
        type="button"
        aria-pressed={mode === 'sign-to-speech'}
        onClick={() => onChange('sign-to-speech')}
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          mode === 'sign-to-speech'
            ? 'bg-white text-blue-600 shadow-lg scale-105'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7v2a4 4 0 01-4 4H8m-4 0v4a2 2 0 002 2h7a2 2 0 002-2V7a2 2 0 00-2-2H8" /></svg>
        Sign to Speech
      </button>
    </div>
  );
};

export default ToggleMode;
