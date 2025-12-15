interface ToggleModeProps {
    mode: 'sign-to-speech' | 'speech-to-sign';
    onChange: (mode: 'sign-to-speech' | 'speech-to-sign') => void;
}

const ToggleMode = ({ mode, onChange }: ToggleModeProps) => {
    return (
        <div className="inline-flex items-center bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50 relative shadow-inner" role="group">

            {/* Speech to Sign */}
            <button
                type="button"
                onClick={() => onChange('speech-to-sign')}
                className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 focus:outline-none ${mode === 'speech-to-sign'
                        ? 'text-blue-600 shadow-sm bg-white'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                <svg className={`w-4 h-4 ${mode === 'speech-to-sign' ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <div className="flex flex-col items-start leading-none">
                    <span>Speech to</span>
                    <span>Sign</span>
                </div>
            </button>

            {/* Sign to Speech */}
            <button
                type="button"
                onClick={() => onChange('sign-to-speech')}
                className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 focus:outline-none ${mode === 'sign-to-speech'
                        ? 'text-blue-600 shadow-sm bg-white'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                <svg className={`w-4 h-4 ${mode === 'sign-to-speech' ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
                <div className="flex flex-col items-start leading-none">
                    <span>Sign to</span>
                    <span>Speech</span>
                </div>
            </button>
        </div>
    );
};

export default ToggleMode;
