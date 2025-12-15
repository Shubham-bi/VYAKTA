import Modal from "./Modal";

interface EndMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const EndMeetingModal = ({ isOpen, onClose, onConfirm }: EndMeetingModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="End Meeting">
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                    <svg className="w-10 h-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-red-800">
                        Are you sure you want to end this meeting? This action cannot be undone.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-700 bg-gray-100 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl text-white bg-red-600 font-bold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                        End Meeting
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EndMeetingModal;
