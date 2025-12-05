interface MeetingSummaryProps {
  summary: string;
  bulletPoints: string[];
  actionItems: string[];
  importantQuotes: string[];
}

export const MeetingSummary = ({ summary, bulletPoints, actionItems, importantQuotes }: MeetingSummaryProps) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Meeting Summary</h2>
      <p className="mb-4">{summary}</p>

      {bulletPoints.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Key Points</h3>
          <ul className="list-disc list-inside">
            {bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Action Items</h3>
          <ul className="list-disc list-inside">
            {actionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {importantQuotes.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Important Quotes</h3>
          <ul className="list-disc list-inside">
            {importantQuotes.map((quote, index) => (
              <li key={index}>"{quote}"</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
