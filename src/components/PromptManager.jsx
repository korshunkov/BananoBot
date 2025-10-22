import { useState, useEffect } from 'react';

export default function PromptManager({ onPromptSelect, mode = 'visual' }) {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [showInput, setShowInput] = useState(false);

  const storageKey = `gemini_prompts_${mode}`;
  const title = mode === 'visual' ? 'Промпты для обработки изображений' : 'Промпты для генерации описаний';
  const placeholder = mode === 'visual'
    ? 'Введите промпт для обработки изображений (например: make it more colorful, add sunglasses, etc.)'
    : 'Введите промпт для генерации описаний (например: Создай продающее описание товара на изображении)';

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const savedPrompts = JSON.parse(saved);
      setPrompts(savedPrompts);
      if (savedPrompts.length > 0) {
        setSelectedPrompt(savedPrompts[0]);
        onPromptSelect(savedPrompts[0]);
      }
    } else {
      // Сбрасываем состояние при смене режима
      setPrompts([]);
      setSelectedPrompt('');
      onPromptSelect('');
    }
  }, [mode]);

  const addPrompt = () => {
    if (newPrompt.trim() && !prompts.includes(newPrompt.trim())) {
      const updatedPrompts = [...prompts, newPrompt.trim()];
      setPrompts(updatedPrompts);
      localStorage.setItem(storageKey, JSON.stringify(updatedPrompts));
      setSelectedPrompt(newPrompt.trim());
      onPromptSelect(newPrompt.trim());
      setNewPrompt('');
      setShowInput(false);
    }
  };

  const handlePromptChange = (prompt) => {
    setSelectedPrompt(prompt);
    onPromptSelect(prompt);
  };

  const deletePrompt = (promptToDelete) => {
    const updatedPrompts = prompts.filter(p => p !== promptToDelete);
    setPrompts(updatedPrompts);
    localStorage.setItem(storageKey, JSON.stringify(updatedPrompts));
    if (selectedPrompt === promptToDelete && updatedPrompts.length > 0) {
      setSelectedPrompt(updatedPrompts[0]);
      onPromptSelect(updatedPrompts[0]);
    } else if (updatedPrompts.length === 0) {
      setSelectedPrompt('');
      onPromptSelect('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>

      {prompts.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выбранный промпт:
          </label>
          <select
            value={selectedPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {prompts.map((prompt, index) => (
              <option key={index} value={prompt}>
                {prompt.substring(0, 50)}{prompt.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            {prompts.map((prompt, index) => (
              <div key={index} className="bg-blue-100 px-3 py-1 rounded-lg flex items-center gap-2">
                <span className="text-sm text-blue-800">{prompt.substring(0, 30)}{prompt.length > 30 ? '...' : ''}</span>
                <button
                  onClick={() => deletePrompt(prompt)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInput ? (
        <div className="space-y-2">
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows="3"
          />
          <div className="flex gap-2">
            <button
              onClick={addPrompt}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Добавить
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          + Добавить промпт
        </button>
      )}
    </div>
  );
}
