function TabSwitcher({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'visual', label: 'Визуал-Бустер' },
    { id: 'description', label: 'Генератор описаний' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabSwitcher;
