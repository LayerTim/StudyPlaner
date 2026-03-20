import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Trash2, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';

const groupBy = (array, keyFn) => {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};

const INITIAL_MODULES = [

];

const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5'];
const CONTAINERS = ['Auflagen', 'Grundlagen IA', 'Ringvorlesung AS', 'Schwerpunkt Lernen', 'Schwerpunkt Planen', 'Schwerpunkt Perzeption',
  'Anwendungsfach', 'Projektarbeit', 'Masterarbeit'];
const STATUSES = ['Planned', 'In Progress', 'Completed'];

export default function StudyPlaner() {
  const [modules, setModules] = useState(() => {
    const saved = localStorage.getItem('studyPlannerModules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MODULES;
      }
    }
    return INITIAL_MODULES;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('studyPlannerModules', JSON.stringify(modules));
  }, [modules]);

  const modulesBySemester = useMemo(() => groupBy(modules, m => m.semester), [modules]);
  const modulesByContainer = useMemo(() => groupBy(modules, m => m.container), [modules]);

  const totalRequiredCredits = 120;
  const totalEarnedCredits = modules
    .filter(m => m.container !== 'Auflagen' && m.status === 'Completed')
    .reduce((sum, m) => sum + m.credits, 0);
  const totalPlannedCredits = modules
    .filter(m => m.container !== 'Auflagen' && m.status !== 'Completed')
    .reduce((sum, m) => sum + m.credits, 0);
  const totalEarnedPercentage = Math.min((totalEarnedCredits / totalRequiredCredits) * 100, 100);
  const totalPlannedPercentage = Math.min((totalPlannedCredits / totalRequiredCredits) * 100, 100 - totalEarnedPercentage);

  const addModule = (newModule) => {
    setModules([...modules, { id: Date.now().toString(), ...newModule }]);
    setIsFormOpen(false);
  };

  const deleteModule = (id) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const moveSemester = (moduleId, newSemester) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, semester: newSemester } : m));
  };

  const toggleStatus = (moduleId) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const nextStatus = m.status === 'Planned' ? 'In Progress' : m.status === 'In Progress' ? 'Completed' : 'Planned';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  return (
    <div className="study-planer-layout">
      <header className="app-header">
        <div className="logo">
          <GraduationCap size={40} className="logo-icon" />
          <h1>Study Planner - Autonomous Systems</h1>
        </div>
        <button className="primary-btn" onClick={() => setIsFormOpen(true)}>
          <PlusCircle size={20} />
          <span>Add Module</span>
        </button>
      </header>

      <div className="overall-progress-section">
        <div className="op-header">
          <h2>Degree Progress</h2>
          <span className="fraction">{totalEarnedCredits} / {totalRequiredCredits} CP</span>
        </div>
        <div className="progress-bar-large">
          <div className="progress-fill earned" style={{ width: `${totalEarnedPercentage}%` }} />
          <div className="progress-fill planned" style={{ width: `${totalPlannedPercentage}%` }} />
        </div>
        <div className="op-legend">
          <span><span className="dot earned" /> Completed ({totalEarnedCredits} CP)</span>
          <span><span className="dot planned" /> Planned/In Progress ({totalPlannedCredits} CP)</span>
        </div>
      </div>

      {isFormOpen && (
        <ModuleModal onClose={() => setIsFormOpen(false)} onAdd={addModule} />
      )}

      <main className="main-content">
        <section className="timeline-section">
          <h2><BookOpen size={24} /> Semester Timeline</h2>
          <div className="timeline-grid">
            {SEMESTERS.map(sem => (
              <SemesterColumn
                key={sem}
                title={sem}
                modules={modulesBySemester[sem] || []}
                onMove={moveSemester}
                onDelete={deleteModule}
                onToggleStatus={toggleStatus}
                allSemesters={SEMESTERS}
              />
            ))}
          </div>
        </section>

        <aside className="analytics-section">
          <h2>Degree Requirements</h2>
          <ContainerAnalytics title="Auflagen" modules={modulesByContainer['Auflagen'] || []} requiredCredits={6} />
          <ContainerAnalytics title="Grundlagen IA" modules={modulesByContainer['Grundlagen IA'] || []} requiredCredits={18} />
          <ContainerAnalytics title="Ringvorlesung AS" modules={modulesByContainer['Ringvorlesung AS'] || []} requiredCredits={6} />
          <ContainerAnalytics title="Schwerpunkt Lernen" modules={modulesByContainer['Schwerpunkt Lernen'] || []} requiredCredits={6} />
          <ContainerAnalytics title="Schwerpunkt Planen" modules={modulesByContainer['Schwerpunkt Planen'] || []} requiredCredits={6} />
          <ContainerAnalytics title="Schwerpunkt Perzeption" modules={modulesByContainer['Schwerpunkt Perzeption'] || []} requiredCredits={6} />
          <ContainerAnalytics title="Anwendungsfach" modules={modulesByContainer['Anwendungsfach'] || []} requiredCredits={12} />
          <ContainerAnalytics title="Projektarbeit" modules={modulesByContainer['Projektarbeit'] || []} requiredCredits={12} />
          <ContainerAnalytics title="Masterarbeit" modules={modulesByContainer['Masterarbeit'] || []} requiredCredits={30} />
        </aside>
      </main>
    </div>
  );
}

function SemesterColumn({ title, modules, onMove, onDelete, onToggleStatus, allSemesters }) {
  const credits = modules.reduce((sum, m) => sum + m.credits, 0);

  return (
    <div className="semester-col">
      <div className="semester-header">
        <h3>{title}</h3>
        <span className="credits-badge">{credits} CP</span>
      </div>
      <div className="module-list">
        {modules.map(module => (
          <div key={module.id} className={`module-card status-${module.status.toLowerCase().replace(' ', '-')}`}>
            <div className="module-header">
              <h4>{module.name}</h4>
              <button
                className="status-toggle"
                onClick={() => onToggleStatus(module.id)}
                title={`Status: ${module.status}. Click to change.`}
              >
                {module.status === 'Completed' && <CheckCircle2 size={18} className="icon-success" />}
                {module.status === 'In Progress' && <div className="icon-pulse" />}
                {module.status === 'Planned' && <div className="icon-planned" />}
              </button>
            </div>
            <div className="module-meta">
              <span className="tag-container">{module.container}</span>
              <span className="tag-credits">{module.credits} CP</span>
            </div>
            <div className="module-actions">
              <select
                value={module.semester}
                onChange={(e) => onMove(module.id, e.target.value)}
                className="semester-select"
              >
                {allSemesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="delete-btn" onClick={() => onDelete(module.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="empty-state">No modules planned</div>
        )}
      </div>
    </div>
  );
}

function ContainerAnalytics({ title, modules, requiredCredits }) {
  const earnedCredits = modules.filter(m => m.status === 'Completed').reduce((sum, m) => sum + m.credits, 0);
  const plannedCredits = modules.filter(m => m.status !== 'Completed').reduce((sum, m) => sum + m.credits, 0);

  const earnedPercentage = Math.min((earnedCredits / requiredCredits) * 100, 100);
  const plannedPercentage = Math.min((plannedCredits / requiredCredits) * 100, 100 - earnedPercentage);

  return (
    <div className="analytics-card">
      <div className="ac-header">
        <h3>{title}</h3>
        <span className="fraction">{earnedCredits} / {requiredCredits} CP</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill earned" style={{ width: `${earnedPercentage}%` }} />
        <div className="progress-fill planned" style={{ width: `${plannedPercentage}%` }} />
      </div>
      <div className="ac-legend">
        <span><span className="dot earned" /> Completed ({earnedCredits})</span>
        <span><span className="dot planned" /> Planned ({plannedCredits})</span>
      </div>
    </div>
  );
}

function ModuleModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(6);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [container, setContainer] = useState(CONTAINERS[0]);
  const [status, setStatus] = useState(STATUSES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, credits: Number(credits), semester, container, status });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add New Module</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Module Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus required placeholder="e.g. Data Structures" />
          </div>
          <div className="form-group-row">
            <div className="form-group">
              <label>Credits (CP)</label>
              <input type="number" value={credits} onChange={e => setCredits(e.target.value)} min="1" max="30" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group-row">
            <div className="form-group">
              <label>Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value)}>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Container</label>
              <select value={container} onChange={e => setContainer(e.target.value)}>
                {CONTAINERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Add Module</button>
          </div>
        </form>
      </div>
    </div>
  );
}
