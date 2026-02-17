'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface UserItem {
  id: string;
  nickname: string;
  created_at: string;
  last_login_at: string;
  is_banned: boolean;
  banned_reason: string | null;
  progress: {
    ai_generations: number;
    saved_numbers_count: number;
    visit_streak: number;
  } | null;
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

// ─── Helpers ────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${formatDate(dateStr)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// ─── Component ──────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');

  // Users state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userStats, setUserStats] = useState({ totalUsers: 0, todayUsers: 0 });

  // Posts state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [postStats, setPostStats] = useState({ totalPosts: 0, todayPosts: 0 });

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ─── Fetch Users ────────────────────────────────────────

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
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [usersPage, userSearch]);

  // ─── Fetch Posts ────────────────────────────────────────

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
        setPostStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, [postsPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ─── Actions ────────────────────────────────────────────

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? '차단을 해제하시겠습니까?' : '이 회원을 차단하시겠습니까?')) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          action: currentlyBanned ? 'unban' : 'ban',
        }),
      });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (err) {
      console.error('Ban toggle failed:', err);
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
      if (data.success) fetchUsers();
    } catch (err) {
      console.error('User delete failed:', err);
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
    } catch (err) {
      console.error('Pin toggle failed:', err);
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
      if (data.success) fetchPosts();
    } catch (err) {
      console.error('Post delete failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Styles ─────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface, #ffffff)',
    border: '1px solid var(--border, #e5e7eb)',
    borderRadius: '12px',
    padding: '16px 20px',
  };

  const statCardStyle: React.CSSProperties = {
    ...cardStyle,
    textAlign: 'center',
    flex: 1,
    minWidth: '140px',
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

  // ─── Render ─────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text, #1f2937)',
          marginBottom: '4px',
        }}>
          관리자 대시보드
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
          회원 및 커뮤니티를 관리합니다
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '4px' }}>
            총 회원
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#D36135' }}>
            {userStats.totalUsers}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '4px' }}>
            오늘 가입
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>
            {userStats.todayUsers}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '4px' }}>
            총 게시글
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#6366F1' }}>
            {postStats.totalPosts}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '4px' }}>
            오늘 게시글
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B' }}>
            {postStats.todayPosts}
          </div>
        </div>
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
        {(['users', 'posts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary, #6b7280)',
              background: activeTab === tab ? '#D36135' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'users' ? '회원 관리' : '게시글 관리'}
          </button>
        ))}
      </div>

      {/* Users Tab */}
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
                    fontSize: '12px',
                    textAlign: 'left',
                  }}>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>닉네임</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>가입일</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>최근 로그인</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>AI생성</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>저장번호</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>상태</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--border, #e5e7eb)',
                        opacity: user.is_banned ? 0.6 : 1,
                      }}
                    >
                      <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--text)' }}>
                        {user.nickname}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                        {formatDate(user.created_at)}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                        {formatDate(user.last_login_at)}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {user.progress?.ai_generations ?? 0}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {user.progress?.saved_numbers_count ?? 0}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
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
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {usersTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {Array.from({ length: Math.min(usersTotalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setUsersPage(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: p === usersPage ? '#D36135' : 'var(--bg, #f3f4f6)',
                    color: p === usersPage ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
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
                    fontSize: '12px',
                    textAlign: 'left',
                  }}>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>제목</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>작성자</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>카테고리</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>조회</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>추천</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600 }}>작성일</th>
                    <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                      <td style={{
                        padding: '10px 6px',
                        fontWeight: 500,
                        color: 'var(--text)',
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {post.is_pinned && <span style={{ color: '#EF4444', marginRight: '4px' }}>📌</span>}
                        {post.title}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                        {post.nickname}
                      </td>
                      <td style={{ padding: '10px 6px' }}>
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
                      <td style={{ padding: '10px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {post.views}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {post.likes}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                        {formatDateTime(post.created_at)}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
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

          {/* Pagination */}
          {postsTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {Array.from({ length: Math.min(postsTotalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPostsPage(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: p === postsPage ? '#D36135' : 'var(--bg, #f3f4f6)',
                    color: p === postsPage ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
