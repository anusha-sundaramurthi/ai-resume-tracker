import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Navbar from '~/components/Navbar';
import { usePuterStore } from '~/lib/puter';
import { generateStyledResumePDF } from '~/lib/resumeGenerator';
import { prepareOptimizationInstructions } from 'constants/index';

interface ResumeData {
  id: string;
  resumePath: string;
  imagePath: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  feedback: {
    score?: number;
    analysis?: string;
  };
}

const ResumeOptimizer = () => {
  const { id } = useParams();
  const { kv, ai, isLoading } = usePuterStore();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        if (!id) return;
        const stored = await kv.get(`resume:${id}`);
        if (stored) {
          const data = JSON.parse(stored);
          setResumeData(data);
        }
      } catch (err) {
        setError('Failed to load resume data');
      }
    };

    fetchResumeData();
  }, [id, kv]);

  const handleOptimizeResume = async () => {
    if (!resumeData) return;

    // Validate required fields
    if (!resumeData.jobTitle || !resumeData.jobDescription) {
      setError('Job title and job description are required for optimization. Please go back and provide these details.');
      return;
    }

    setIsOptimizing(true);
    setStatusText('Generating optimized resume...');
    setError('');

    try {
      const optimizationPrompt = prepareOptimizationInstructions({
        jobTitle: resumeData.jobTitle,
        jobDescription: resumeData.jobDescription,
        companyName: resumeData.companyName || 'Target Company',
        currentFeedback: resumeData.feedback.analysis,
      });

      const response = await ai.chat(
        [
          {
            role: 'user',
            content: [
              {
                type: 'file',
                puter_path: resumeData.resumePath,
              },
              {
                type: 'text',
                text: optimizationPrompt,
              },
            ],
          },
        ],
        { model: 'claude-3-7-sonnet' }
      );

      if (!response) {
        setError('Failed to generate optimized resume');
        setStatusText('');
        setIsOptimizing(false);
        return;
      }

      const optimizedText = typeof response.message.content === 'string'
        ? response.message.content
        : response.message.content[0].text;

      setOptimizedResume(optimizedText);
      setStatusText('Optimization complete! Ready to download.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Optimization failed: ${errorMsg}`);
      setStatusText('');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!optimizedResume || !resumeData) return;

    setIsDownloading(true);
    setStatusText('Generating PDF...');

    try {
      await generateStyledResumePDF(
        optimizedResume,
        resumeData.resumePath.split('/').pop() || 'resume.pdf',
        {
          jobTitle: resumeData.jobTitle,
          companyName: resumeData.companyName,
        }
      );
      setStatusText('PDF downloaded successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Download failed';
      setError(errorMsg);
      setStatusText('');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!resumeData) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Loading Resume...</h1>
            {isLoading && <p>Retrieving your resume data...</p>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Resume Optimizer</h1>
          <h2>Generate your ATS-optimized resume</h2>

          <div className="mt-8 space-y-6">
            {/* Resume Info */}
            <div className="bg-white bg-opacity-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Job Details
              </h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Company:</strong> {resumeData.companyName}</p>
                <p><strong>Position:</strong> {resumeData.jobTitle}</p>
                <p><strong>Current ATS Score:</strong> {resumeData.feedback.score || 'N/A'}/100</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Status Messages */}
            {statusText && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                {statusText}
              </div>
            )}

            {/* Optimize Button */}
            {!optimizedResume && (
              <button
                onClick={handleOptimizeResume}
                disabled={isOptimizing}
                className="primary-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOptimizing ? 'Optimizing...' : 'Generate Optimized Resume'}
              </button>
            )}

            {/* Optimized Resume Preview */}
            {optimizedResume && (
              <>
                <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto border-2 border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Optimized Resume Preview
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {optimizedResume}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="primary-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    'Generating PDF...'
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Download as PDF</span>
                    </>
                  )}
                </button>

                {/* Back to Analysis Button */}
                <button
                  onClick={() => window.history.back()}
                  className="secondary-button w-full"
                >
                  Back to Analysis
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResumeOptimizer;