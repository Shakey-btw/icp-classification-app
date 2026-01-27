import CsvUpload from '@/components/upload/CsvUpload';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium text-gray-900 mb-4">
            ICP Classification
          </h1>
          <p className="text-gray-600">
            Upload a CSV with website URLs to start classifying
          </p>
        </div>

        {/* Upload Component */}
        <CsvUpload />
      </div>
    </main>
  );
}
