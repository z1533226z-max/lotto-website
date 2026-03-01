'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface UserProgress {
  ai_generations: number;
  simulator_runs: number;
  dream_generations: number;
  fortune_generations: number;
  page_views: number;
  saved_numbers_count: number;
  match_checks_count: number;
  multi_set_generations: number;
  visit_streak: number;
  longest_streak: number;
  last_visit_date: string | null;
  first_visit_date: string | null;
  unlocked_badges: string[];
  updated_at: string | null;
}

interface UserItem {
  id: string;
  nickname: string;
  created_at: string;
  last_login_at: string;
  is_banned: boolean;
  banned_reason: string | null;
  progress: UserProgress | null;
}

interface PostItem {
  id: string;
  nickname: string;
  title: string;
  category: string;
  likes: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
}

interface SiteStats {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    banned: number;
    activeToday: number;
  };
  posts: {
    total: number;
    today: number;
    thisWeek: number;
    pinned: number;
  };
  comments: {
    total: number;
    today: number;
  };
  activity: {
    totalAiGenerations: number;
    totalSimulatorRuns: number;
    totalDreamGenerations: number;
    totalFortuneGenerations: number;
    totalPageViews: number;
    totalSavedNumbers: number;
    savedNumbersCount: number;
    maxStreak: number;
  };
  recentUsers: { id: string; nickname: string; created_at: string; last_login_at: string }[];
}

// ─── Helpers ────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return `${formatDate(dateStr)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(dateStr);
}

// ─── Shared Styles ──────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--surface, #ffffff)',
  border: '1px solid var(--border, #e5e7eb)',
  borderRadius: '12px',
  padding: '16px 20px',
};

const btnSmall = (color: string): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  background: color,
  color: '#fff',
  transition: 'opacity 0.15s',
});

const thStyle: React.CSSProperties = {
  padding: '8px 6px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 6px',
  color: 'var(--text-secondary)',
};

// ─── Component ──────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts'>('overview');

  // Overview state
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Posts state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ─── Fetch Site Stats ─────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSiteStats(data.stats);
    } catch {
      // 통계 조회 실패
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─── Fetch Users ──────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(usersPage),
        limit: '15',
      });
      if (userSearch) params.set('search', userSearch);

      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setUsersTotalPages(data.pagination.totalPages);
        setUsersTotal(data.pagination.total);
      }
    } catch {
      // 회원 조회 실패
    } finally {
      setUsersLoading(false);
    }
  }, [usersPage, userSearch]);

  // ─── Fetch Posts ──────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(postsPage),
        limit: '15',
      });

      const res = await fetch(`/api/admin/posts?${params}`, { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
        setPostsTotalPages(data.pagination.totalPages);
      }
    } catch {
      // 게시글 조회 실패
    } finally {
      setPostsLoading(false);
    }
  }, [postsPage]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ─── Actions ──────────────────────────────────────────────

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? '차단을 해제하시겠습니까?' : '이 회원을 차단하시겠습니까?')) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action: currentlyBanned ? 'unban' : 'ban' }),
      });
      const data = await res.json();
      if (data.success) { fetchUsers(); fetchStats(); }
    } catch {
      // 차단 토글 실패
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, nickname: string) => {
    if (!confirm(`"${nickname}" 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) { fetchUsers(); fetchStats(); }
    } catch {
      // 회원 삭제 실패
    } finally {
      setActionLoading(null);
    }
  };

  const handlePinToggle = async (postId: string, currentlyPinned: boolean) => {
    setActionLoading(postId);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId, is_pinned: !currentlyPinned }),
      });
      const data = await res.json();
      if (data.success) fetchPosts();
    } catch {
      // 고정 토글 실패
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
    setActionLoading(postId);
    try {
      const res = await fetch(`/api/admin/posts?postId=${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) { fetchPosts(); fetchStats(); }
    } catch {
      // 게시글 삭제 실패
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Sub-Components ───────────────────────────────────────

  const StatCard = ({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) => (
    <div style={{
      ...cardStyle,
      textAlign: 'center',
      flex: '1 1 130px',
      minWidth: '130px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary, #9ca3af)', marginBottom: '2px', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color, lineHeight: 1.2 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && (
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary, #9ca3af)', marginTop: '2px' }}>
          {sub}
        </div>
      )}
    </div>
  );

  const Pagination = ({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) => {
    if (total <= 1) return null;
    const pages: number[] = [];
    const start = Math.max(1, current - 4);
    const end = Math.min(total, start + 9);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
        {current > 1 && (
          <button onClick={() => onChange(current - 1)} style={btnSmall('var(--surface-active, #e5e7eb)')}>
            <span style={{ color: 'var(--text)' }}>&#8249;</span>
          </button>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: '5px 11px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: p === current ? '#D36135' : 'var(--bg, #f3f4f6)',
              color: p === current ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {p}
          </button>
        ))}
        {current < total && (
          <button onClick={() => onChange(current + 1)} style={btnSmall('var(--surface-active, #e5e7eb)')}>
            <span style={{ color: 'var(--text)' }}>&#8250;</span>
          </button>
        )}
      </div>
    );
  };

  // ─── Tab Labels ───────────────────────────────────────────

  const tabs = [
    { key: 'overview' as const, label: '사이트 현황' },
    { key: 'users' as const, label: `회원 관리 (${usersTotal})` },
    { key: 'posts' as const, label: '게시글 관리' },
  ];

  // ─── Render ───────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text, #1f2937)', marginBottom: '2px' }}>
            관리자 대시보드
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
            사이트 운영 현황을 한눈에 확인하고 관리합니다
          </p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchUsers(); fetchPosts(); }}
          style={{
            ...btnSmall('#6366F1'),
            padding: '6px 14px',
            fontSize: '13px',
          }}
        >
          새로고침
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        background: 'var(--bg, #f3f4f6)',
        borderRadius: '10px',
        padding: '4px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary, #6b7280)',
              background: activeTab === tab.key ? '#D36135' : 'transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          OVERVIEW TAB
          ══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              통계 로딩 중...
            </div>
          ) : siteStats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 회원 통계 */}
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                  회원 현황
                </h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <StatCard label="총 회원" value={siteStats.users.total} color="#D36135" />
                  <StatCard label="오늘 가입" value={siteStats.users.today} color="#10B981" />
                  <StatCard label="이번주 가입" value={siteStats.users.thisWeek} color="#3B82F6" />
                  <StatCard label="이번달 가입" value={siteStats.users.thisMonth} color="#8B5CF6" />
                  <StatCard label="오늘 활동" value={siteStats.users.activeToday} color="#F59E0B" sub="로그인 기준" />
                  <StatCard label="차단 회원" value={siteStats.users.banned} color="#EF4444" />
                </div>
              </div>

              {/* 커뮤니티 통계 */}
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                  커뮤니티 현황
                </h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <StatCard label="총 게시글" value={siteStats.posts.total} color="#6366F1" />
                  <StatCard label="오늘 게시글" value={siteStats.posts.today} color="#10B981" />
                  <StatCard label="이번주 게시글" value={siteStats.posts.thisWeek} color="#3B82F6" />
                  <StatCard label="고정 게시글" value={siteStats.posts.pinned} color="#F59E0B" />
                  <StatCard label="총 댓글" value={siteStats.comments.total} color="#8B5CF6" />
                  <StatCard label="오늘 댓글" value={siteStats.comments.today} color="#10B981" />
                </div>
              </div>

              {/* AI/기능 사용 통계 */}
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                  기능 사용 현황 (전체 누적)
                </h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <StatCard label="AI 번호 생성" value={siteStats.activity.totalAiGenerations} color="#D36135" />
                  <StatCard label="시뮬레이터" value={siteStats.activity.totalSimulatorRuns} color="#3B82F6" />
                  <StatCard label="꿈번호 생성" value={siteStats.activity.totalDreamGenerations} color="#8B5CF6" />
                  <StatCard label="행운번호 생성" value={siteStats.activity.totalFortuneGenerations} color="#10B981" />
                  <StatCard label="페이지뷰" value={siteStats.activity.totalPageViews} color="#6366F1" />
                  <StatCard label="저장 번호" value={siteStats.activity.savedNumbersCount} color="#F59E0B" sub={`${siteStats.activity.totalSavedNumbers}세트`} />
                  <StatCard label="최고 연속방문" value={`${siteStats.activity.maxStreak}일`} color="#EF4444" />
                </div>
              </div>

              {/* 최근 가입 회원 */}
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                  최근 가입 회원
                </h2>
                <div style={cardStyle}>
                  {siteStats.recentUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      가입 회원이 없습니다.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {siteStats.recentUsers.map((u) => (
                        <div key={u.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg, #f9fafb)',
                          fontSize: '13px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: '#D36135', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: 700,
                            }}>
                              {u.nickname.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.nickname}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>가입: {timeAgo(u.created_at)}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                            최근 활동: {timeAgo(u.last_login_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              통계를 불러오지 못했습니다.
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          USERS TAB
          ══════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div style={cardStyle}>
          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="닉네임 검색..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)',
                background: 'var(--bg, #f9fafb)',
                color: 'var(--text, #1f2937)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              로딩 중...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              회원이 없습니다.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--border, #e5e7eb)',
                    color: 'var(--text-secondary, #6b7280)',
                    fontSize: '11px',
                    textAlign: 'left',
                  }}>
                    <th style={thStyle}>닉네임</th>
                    <th style={thStyle}>가입일</th>
                    <th style={thStyle}>최근 로그인</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>AI</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>시뮬</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>꿈번호</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>행운</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>저장</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>연속</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>상태</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const p = user.progress;
                    const isExpanded = expandedUser === user.id;
                    return (
                      <React.Fragment key={user.id}>
                        <tr
                          style={{
                            borderBottom: isExpanded ? 'none' : '1px solid var(--border, #e5e7eb)',
                            opacity: user.is_banned ? 0.6 : 1,
                            cursor: 'pointer',
                          }}
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                        >
                          <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text)' }}>
                            {user.nickname}
                          </td>
                          <td style={tdStyle}>{formatDate(user.created_at)}</td>
                          <td style={tdStyle}>{timeAgo(user.last_login_at)}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {p?.ai_generations ?? 0}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {p?.simulator_runs ?? 0}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {p?.dream_generations ?? 0}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {p?.fortune_generations ?? 0}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {p?.saved_numbers_count ?? 0}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{ fontWeight: 600, color: (p?.visit_streak ?? 0) >= 7 ? '#D36135' : 'var(--text-secondary)' }}>
                              {p?.visit_streak ?? 0}일
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: user.is_banned ? '#FEE2E2' : '#D1FAE5',
                              color: user.is_banned ? '#EF4444' : '#10B981',
                            }}>
                              {user.is_banned ? '차단' : '정상'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleBanToggle(user.id, user.is_banned)}
                                disabled={actionLoading === user.id}
                                style={btnSmall(user.is_banned ? '#10B981' : '#F59E0B')}
                              >
                                {user.is_banned ? '해제' : '차단'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.nickname)}
                                disabled={actionLoading === user.id}
                                style={btnSmall('#EF4444')}
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded Detail Row */}
                        {isExpanded && p && (
                          <tr style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                            <td colSpan={11} style={{ padding: '0 6px 12px' }}>
                              <div style={{
                                background: 'var(--bg, #f9fafb)',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '10px',
                                fontSize: '12px',
                              }}>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>페이지뷰</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{p.page_views ?? 0}</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>당첨 확인</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{p.match_checks_count ?? 0}회</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>5세트 생성</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{p.multi_set_generations ?? 0}회</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>최고 연속방문</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{p.longest_streak ?? 0}일</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>첫 방문</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{formatDate(p.first_visit_date)}</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>마지막 방문</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{formatDate(p.last_visit_date)}</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>획득 배지</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{(p.unlocked_badges ?? []).length}개</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-tertiary)' }}>데이터 갱신</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{timeAgo(p.updated_at)}</div>
                                </div>
                                {user.is_banned && user.banned_reason && (
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <span style={{ color: '#EF4444' }}>차단 사유</span>
                                    <div style={{ fontWeight: 600, color: '#EF4444' }}>{user.banned_reason}</div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination current={usersPage} total={usersTotalPages} onChange={setUsersPage} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          POSTS TAB
          ══════════════════════════════════════════════════════ */}
      {activeTab === 'posts' && (
        <div style={cardStyle}>
          {postsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              로딩 중...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              게시글이 없습니다.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--border, #e5e7eb)',
                    color: 'var(--text-secondary, #6b7280)',
                    fontSize: '11px',
                    textAlign: 'left',
                  }}>
                    <th style={thStyle}>제목</th>
                    <th style={thStyle}>작성자</th>
                    <th style={thStyle}>카테고리</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>조회</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>추천</th>
                    <th style={thStyle}>작성일</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                      <td style={{
                        ...tdStyle,
                        fontWeight: 500,
                        color: 'var(--text)',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {post.is_pinned && (
                          <span style={{
                            display: 'inline-block',
                            background: '#EF4444',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            marginRight: '6px',
                          }}>
                            PIN
                          </span>
                        )}
                        {post.title}
                      </td>
                      <td style={tdStyle}>{post.nickname}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'var(--bg, #f3f4f6)',
                          color: 'var(--text-secondary)',
                        }}>
                          {post.category}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {post.views.toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {post.likes}
                      </td>
                      <td style={tdStyle}>{formatDateTime(post.created_at)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handlePinToggle(post.id, post.is_pinned)}
                            disabled={actionLoading === post.id}
                            style={btnSmall(post.is_pinned ? '#6B7280' : '#6366F1')}
                          >
                            {post.is_pinned ? '해제' : '고정'}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            disabled={actionLoading === post.id}
                            style={btnSmall('#EF4444')}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination current={postsPage} total={postsTotalPages} onChange={setPostsPage} />
        </div>
      )}
    </div>
  );
}
