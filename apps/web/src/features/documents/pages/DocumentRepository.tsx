import { useState } from 'react';
import { useGetDocumentsQuery } from '../api/documentsApi';
import { FileText, Download, Filter, Search, Upload } from 'lucide-react';
import { format } from 'date-fns';

export function DocumentRepository() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('');
  
  const { data: documents = [], isLoading } = useGetDocumentsQuery({ category: category || undefined });

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Document Repository</h1>
          <p className="text-muted-foreground">Manage and securely store hospital documents</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-xl shadow-sm border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="relative w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
          >
            <option value="">All Categories</option>
            <option value="CLINICAL">Clinical Notes</option>
            <option value="LAB">Lab Reports</option>
            <option value="LEGAL">Legal / Consents</option>
            <option value="ADMIN">Administrative</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No documents found.</div>
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc._id} className="bg-card p-4 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 transition-colors group">
              <div className="h-32 bg-muted/30 rounded-lg mb-4 flex items-center justify-center relative group-hover:bg-primary/5 transition-colors">
                <FileText className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                <button className="absolute inset-0 m-auto h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-semibold text-foreground truncate" title={doc.title}>{doc.title}</h3>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded-md">{doc.category}</span>
                <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
