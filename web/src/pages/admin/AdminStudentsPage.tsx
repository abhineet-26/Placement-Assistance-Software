import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const { data: students, isLoading } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: async () => (await api.get('/admin/students')).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1 font-bold text-primary">Students</h1>
        </div>
        <div className="h-14 bg-surface rounded-xl shadow-card border border-border animate-pulse mb-6" />
        <div className="bg-surface rounded-xl shadow-card p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-background rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = students?.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-primary mb-1">Students</h1>
        <p className="text-text-secondary">Manage and track student placement status.</p>
      </div>
      
      <div className="bg-surface p-4 rounded-xl flex items-center shadow-card focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <svg className="w-5 h-5 text-text-secondary mr-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text" 
          placeholder="Search by name or roll number..." 
          className="flex-1 bg-transparent border-none focus:outline-none text-text-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border/60">
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Name</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Roll No</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Branch</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">CGPA</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Backlogs</th>
                <th className="p-5 font-semibold text-sm text-text-secondary uppercase tracking-wider">Placement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((student: any, idx: number) => (
                <tr key={student.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-colors`}>
                  <td className="p-5 font-medium text-text-primary">{student.name}</td>
                  <td className="p-5 text-text-secondary">{student.roll_number}</td>
                  <td className="p-5 text-text-secondary">{student.branch}</td>
                  <td className="p-5 text-text-secondary font-medium">{student.cgpa}</td>
                  <td className="p-5 text-text-secondary">{student.backlogs || 0}</td>
                  <td className="p-5">
                    <StatusBadge status={student.placement_status || 'unplaced'} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-50">🎓</div>
                      <p className="font-medium text-text-primary">No students found.</p>
                      <p className="text-sm mt-1">Try a different search term.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
