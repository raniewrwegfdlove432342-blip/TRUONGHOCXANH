/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, PillarItem, NewsArticle } from './types';
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
import { VideoView } from './components/VideoView';
import { ReportIncidentView } from './components/ReportIncidentView';
import { AiCounselorView } from './components/AiCounselorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [pledgeCount, setPledgeCount] = useState<number>(1869);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<PillarItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommitment={() => setIsCommitmentModalOpen(true)}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
      />

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-1 py-1">
            {[
              { id: 'home' as ActiveTab, label: 'Trang chủ' },
              { id: 'knowledge' as ActiveTab, label: 'Cẩm nang kiến thức' },
              { id: 'quiz' as ActiveTab, label: 'Trắc nghiệm 10 câu' },
              { id: 'games' as ActiveTab, label: '8 Trò chơi giáo dục' },
              { id: 'video' as ActiveTab, label: 'Video tuyên truyền' },
              { id: 'ai' as ActiveTab, label: 'Cố vấn AI học đường' },
              { id: 'report' as ActiveTab, label: 'Hộp thư Báo Cáo Ẩn Danh' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? tab.id === 'report'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : tab.id === 'report'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCommitmentModalOpen(true)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
          >
            ✨ {pledgeCount.toLocaleString('vi-VN')} Đã Ký Cam Kết
          </button>
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

        {activeTab === 'quiz' && <QuizView />}

        {activeTab === 'games' && <GameArenaView />}

        {activeTab === 'video' && <VideoView />}

        {activeTab === 'ai' && (
          <AiCounselorView onOpenReport={() => setActiveTab('report')} />
        )}

        {activeTab === 'report' && (
          <ReportIncidentView
            isAdminMode={isAdminMode}
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
    </div>
  );
}
