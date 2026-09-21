import { FileText, Download, ExternalLink, ShieldCheck, BookOpen, Award, FileCheck } from 'lucide-react';

export interface PDFDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  fileName: string;
  fileSize: string;
  url: string;
  badgeColor: string;
  icon: typeof FileText;
}

export const INITIAL_PDF_DOCUMENTS: PDFDocument[] = [
  {
    id: 'doc-1',
    title: 'Imported Industrial Chemicals Product List (2025-2026)',
    category: 'Industrial Chemicals',
    description: 'Complete product range catalog for imported industrial chemicals, CAS numbers, and packaging grades.',
    fileName: 'Product List Imported industrial chemicals 2025-2026.pdf',
    fileSize: '587 KB',
    url: '/documents/Product List Imported industrial chemicals 2025-2026.pdf',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: BookOpen,
  },
  {
    id: 'doc-2',
    title: 'Food, Pharma & Nutraceutical Chemicals List (2025-2026)',
    category: 'Food & Pharma',
    description: 'Comprehensive catalog for food grade, pharmaceutical raw materials, and nutraceutical chemical compounds.',
    fileName: 'Product list Food,Pharma,Nutraceutical chemicals 2025-2026.pdf',
    fileSize: '220 KB',
    url: '/documents/Product list Food,Pharma,Nutraceutical chemicals 2025-2026.pdf',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: FileCheck,
  },
  {
    id: 'doc-3',
    title: 'Fragrance & Flavour Chemicals Product List (2025-2026)',
    category: 'Fragrance & Flavours',
    description: 'Specialized chemical list for fine fragrances, aroma chemicals, essential oils, and flavouring agents.',
    fileName: 'Product list Fragrance and flavour Chemicals list 2025-2026.pdf',
    fileSize: '197 KB',
    url: '/documents/Product list Fragrance and flavour Chemicals list 2025-2026.pdf',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: ShieldCheck,
  },
  {
    id: 'doc-4',
    title: 'Speciality Chemicals Product List (2025-2026)',
    category: 'Speciality Chemicals',
    description: 'High-purity speciality chemicals, custom synthesis raw materials, and niche chemical formulations.',
    fileName: 'Product list Speciality chemicals product list 2025-2026.pdf',
    fileSize: '309 KB',
    url: '/documents/Product list Speciality chemicals product list 2025-2026.pdf',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Award,
  },
];

interface ProductDocumentsProps {
  documents?: PDFDocument[];
}

export default function ProductDocuments({ documents = INITIAL_PDF_DOCUMENTS }: ProductDocumentsProps) {
  const handleViewPDF = (doc: PDFDocument) => {
    window.open(doc.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPDF = (doc: PDFDocument) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mt-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
              <FileText className="h-5 w-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Product Catalog &amp; Technical Documents
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Download or view official chemical specifications, safety data sheets, and company brochures
          </p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs self-start sm:self-auto">
          {documents.length} PDF Documents Available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documents.map((doc) => {
          const IconComponent = doc.icon || FileText;

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-1 ${doc.badgeColor}`}>
                        {doc.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  {doc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-400 font-mono">
                  PDF • {doc.fileSize}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewPDF(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                    title="View PDF document in browser"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View PDF
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                    title="Download PDF document"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
