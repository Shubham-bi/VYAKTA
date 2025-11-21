interface ToggleModeProps {
  mode: 'sign-to-speech' | 'speech-to-sign';
  onChange: (mode: 'sign-to-speech' | 'speech-to-sign') => void;
}

const ToggleMode = ({ mode, onChange }: ToggleModeProps) => {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('speech-to-sign')}
        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
          mode === 'speech-to-sign'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Speech to Sign
      </button>
      <button
        type="button"
        onClick={() => onChange('sign-to-speech')}
        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
          mode === 'sign-to-speech'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Sign to Speech
      </button>
    </div>
  );
};

export default ToggleMode;
