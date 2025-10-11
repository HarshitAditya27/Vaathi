function HistoryList({ history, onSelect }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="max-w-lg mx-auto mt-6">
      <h3 className="text-lg font-semibold mb-2">📚 Previous Topics</h3>
      <ul className="list-disc list-inside space-y-2">
        {history.map((item, i) => (
          <li
            key={i}
            className="cursor-pointer text-blue-700 hover:underline"
            onClick={() => onSelect(i)}
          >
            {item.topic} —{" "}
            <span className="text-gray-500 text-sm">
              {new Date(item.date).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryList;
