import React, { useState } from 'react';

interface PasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  message?: string;
}

const PasswordConfirmationModal: React.FC<PasswordConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Password',
  message = 'Please enter your password to proceed.',
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password cannot be empty.');
      return;
    }
    setError('');
    onConfirm(password);
    setPassword(''); // Clear password after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password-confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { 
                onClose(); 
                setPassword(''); 
                setError(''); 
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordConfirmationModal;