import * as XLSX from 'xlsx';

function ResultsTable({ results, onRegenerate, onRetryErrors }) {
  const hasErrors = results.some(r => r.error);

  const exportToXLSX = () => {
    // Создаем данные для экспорта
    const data = results.map(result => ({
      'Название файла': result.originalName,
      'Описание': result.error ? `ОШИБКА: ${result.error}` : result.description || 'Обработка...'
    }));

    // Создаем рабочую книгу
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Описания');

    // Автоматическая ширина колонок
    const maxWidth = 50;
    const columnWidths = [
      { wch: Math.min(Math.max(...data.map(d => d['Название файла'].length)), maxWidth) },
      { wch: maxWidth }
    ];
    ws['!cols'] = columnWidths;

    // Сохраняем файл
    XLSX.writeFile(wb, 'описания_товаров.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Результаты</h2>
        <div className="flex gap-2">
          {hasErrors && (
            <button
              onClick={onRetryErrors}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Перегенерировать ошибки
            </button>
          )}
          <button
            onClick={exportToXLSX}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Сохранить XLSX
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
                Название файла
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
                Описание
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-300 w-32">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 align-top">
                  {result.originalName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {result.processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      <span className="text-gray-500">Генерация...</span>
                    </div>
                  ) : result.error ? (
                    <div className="text-red-600">
                      <strong>Ошибка:</strong> {result.error}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{result.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center align-top">
                  {result.error && (
                    <button
                      onClick={() => onRegenerate(result.id)}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
                    >
                      Повторить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Всего: {results.length} | Успешно: {results.filter(r => r.description && !r.error).length} | Ошибок: {results.filter(r => r.error).length} | Обработка: {results.filter(r => r.processing).length}
      </div>
    </div>
  );
}

export default ResultsTable;
