import React from 'react';

type CVDetail = {
  id: string;
  summary: string | null;
  academic_record: any;
  skills: string[] | null;
  projects: any[] | null;
  certifications: any[] | null;
};

type CVPreviewPanelProps = {
  cv: CVDetail;
};

const CVPreviewPanel: React.FC<CVPreviewPanelProps> = ({ cv }) => {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-primary mb-2">Summary</h3>
        <p className="text-text text-sm">{cv.summary || "No summary provided."}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-primary mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {cv.skills && cv.skills.length > 0 ? (
            cv.skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-gray-200">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-text-secondary text-sm">No skills listed.</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-primary mb-2">Academic Record</h3>
        {cv.academic_record ? (
          <pre className="bg-gray-50 p-3 rounded text-xs text-text overflow-x-auto border border-gray-100">
            {JSON.stringify(cv.academic_record, null, 2)}
          </pre>
        ) : (
          <p className="text-text-secondary text-sm">No academic record available.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-bold text-primary mb-2">Projects</h3>
          {cv.projects && cv.projects.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-text space-y-1">
              {cv.projects.map((p, idx) => (
                <li key={idx}>
                  <strong>{p.name || p.title || 'Project'}</strong>
                  {p.description && <p className="text-text-secondary mt-1">{p.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">No projects listed.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-primary mb-2">Certifications</h3>
          {cv.certifications && cv.certifications.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-text space-y-1">
              {cv.certifications.map((c, idx) => (
                <li key={idx}>{c.name || c.title || 'Certification'}</li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">No certifications listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVPreviewPanel;
