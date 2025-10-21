import { useState, useEffect } from 'react';

export default function APIKeyManager({ onKeySelect }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_keys');
    if (saved) {
      const keys = JSON.parse(saved);
      setApiKeys(keys);
      if (keys.length > 0) {
        setSelectedKey(keys[0]);
        onKeySelect(keys[0]);
      }
    }
  }, []);

  const addApiKey = () => {
    if (newKey.trim() && !apiKeys.includes(newKey.trim())) {
      const updatedKeys = [...apiKeys, newKey.trim()];
      setApiKeys(updatedKeys);
      localStorage.setItem('gemini_api_keys', JSON.stringify(updatedKeys));
      setSelectedKey(newKey.trim());
      onKeySelect(newKey.trim());
      setNewKey('');
      setShowInput(false);
    }
  };

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    onKeySelect(key);
  };

  const deleteKey = (keyToDelete) => {
    const updatedKeys = apiKeys.filter(k => k !== keyToDelete);
    setApiKeys(updatedKeys);
    localStorage.setItem('gemini_api_keys', JSON.stringify(updatedKeys));
    if (selectedKey === keyToDelete && updatedKeys.length > 0) {
      setSelectedKey(updatedKeys[0]);
      onKeySelect(updatedKeys[0]);
    } else if (updatedKeys.length === 0) {
      setSelectedKey('');
      onKeySelect('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">API Ключи Google Gemini</h2>

      {apiKeys.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выбранный ключ:
          </label>
          <select
            value={selectedKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {apiKeys.map((key, index) => (
              <option key={index} value={key}>
                {key.substring(0, 20)}...
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            {apiKeys.map((key, index) => (
              <div key={index} className="bg-purple-100 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="text-sm text-purple-800">{key.substring(0, 15)}...</span>
                <button
                  onClick={() => deleteKey(key)}
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
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Введите API ключ"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addApiKey()}
          />
          <button
            onClick={addApiKey}
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
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          + Добавить API ключ
        </button>
      )}
    </div>
  );
}
