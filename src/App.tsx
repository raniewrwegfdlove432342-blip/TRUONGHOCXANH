/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, PillarItem, NewsArticle, UserAccount } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FloatingMascot } from './components/FloatingMascot';
import { CommitmentModal } from './components/CommitmentModal';
import { PillarDetailModal } from './components/PillarDetailModal';
import { ArticleModal } from './components/ArticleModal';
import { HomeView } from './components/HomeView';
import { KnowledgeView } from './components/KnowledgeView';
import { QuizView } from './components/QuizView';
import { GameArenaView } from './components/GameArenaView';
import { ReportIncidentView } from './components/ReportIncidentView';
import { AiCounselorView } from './components/AiCounselorView';
import { StudentVideoView } from './components/StudentVideoView';
import { AuthModal } from './components/AuthModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [pledgeCount, setPledgeCount] = useState<number>(1869);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<PillarItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Authentication & Google Sheets State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('lchd_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);

  useEffect(() => {
    // Fetch live commitment count
    fetch('/api/commitments')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setPledgeCount(data.count);
        }
      })
      .catch((err) => console.log('Could not fetch initial commitments:', err));
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('lchd_user', JSON.stringify(user));
    } catch {}
    if (user.role === 'teacher') {
      setIsAdminMode(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('lchd_user');
    } catch {}
    setIsAdminMode(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommitment={() => setIsCommitmentModalOpen(true)}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenGoogleSheetSync={() => setIsGoogleSheetModalOpen(true)}
      />

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white border-b border-emerald-100 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-1 py-1">
            {[
              { id: 'home' as ActiveTab, label: 'Trang chủ' },
              { id: 'knowledge' as ActiveTab, label: 'Báo chí & ATTT' },
              { id: 'student-videos' as ActiveTab, label: 'Video HS sáng tạo' },
              { id: 'quiz' as ActiveTab, label: 'Trắc nghiệm 10 câu' },
              { id: 'games' as ActiveTab, label: '8 Trò chơi' },
              { id: 'ai' as ActiveTab, label: 'Cố vấn AI học đường' },
              { id: 'report' as ActiveTab, label: 'Báo Cáo Ẩn Danh' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? tab.id === 'report'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-emerald-700 text-white shadow-xs'
                    : tab.id === 'report'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsGoogleSheetModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                title="Đồng bộ mọi tài khoản và báo cáo vào Google Sheet"
              >
                📊 Google Sheet Sync
              </button>
            )}

            <button
              onClick={() => setIsCommitmentModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              🌿 {pledgeCount.toLocaleString('vi-VN')} Đã Ký Cam Kết
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            pledgeCount={pledgeCount}
            onOpenCommitment={() => setIsCommitmentModalOpen(true)}
            onSelectPillar={(pillar) => setSelectedPillar(pillar)}
            onSelectArticle={(article) => setSelectedArticle(article)}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeView
            onSelectArticle={(article) => setSelectedArticle(article)}
            onOpenReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'student-videos' && (
          <StudentVideoView
            currentUser={currentUser}
            isAdmin={currentUser?.role === 'admin'}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenGoogleSheetSync={() => setIsGoogleSheetModalOpen(true)}
          />
        )}

        {activeTab === 'quiz' && <QuizView />}

        {activeTab === 'games' && <GameArenaView />}

        {activeTab === 'ai' && (
          <AiCounselorView onOpenReport={() => setActiveTab('report')} />
        )}

        {activeTab === 'report' && (
          <ReportIncidentView
            isAdminMode={currentUser?.role === 'admin'}
            setIsAdminMode={setIsAdminMode}
          />
        )}
      </main>

      {/* Floating Police Officer Mascot */}
      <FloatingMascot
        onOpenAi={() => setActiveTab('ai')}
        onOpenReport={() => setActiveTab('report')}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Commitment Pledge Modal */}
      <CommitmentModal
        isOpen={isCommitmentModalOpen}
        onClose={() => setIsCommitmentModalOpen(false)}
        pledgeCount={pledgeCount}
        onPledged={(newCount) => setPledgeCount(newCount)}
      />

      {/* Pillar Detail Modal */}
      <PillarDetailModal
        pillar={selectedPillar}
        onClose={() => setSelectedPillar(null)}
        onNavigateToGames={() => setActiveTab('games')}
      />

      {/* Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onOpenReport={() => setActiveTab('report')}
      />

      {/* Auth Modal (Login / Register for Teachers & Students) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Google Sheets Sync & Live Status Modal */}
      <GoogleSheetSyncModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
      />
    </div>
  );
}
