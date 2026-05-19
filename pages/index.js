import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

// ─── Storage key ─────────────────────────────────────────────────────────────
const STORE_KEY = 'instaTool_posts'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)

const blankPost = () => ({
  id: uid(),
  link: '',
  caption: '',
  date: new Date().toISOString().slice(0, 10),
  type: 'reel',
  tags: '',
  is_most_liked: false,
  is_most_commented: false,
  is_most_viewed: false,
  is_first_post: false,
})

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || [blankPost()] }
  catch { return [blankPost()] }
}
function save(posts) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(posts)) } catch {}
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1a2e1a', border: '1px solid #22c55e', color: '#4ade80',
      padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 30px rgba(0,0,0,.5)',
      animation: 'fadeUp .22s ease',
    }}>
      {msg}
    </div>
  )
}

// ─── Single post entry row ────────────────────────────────────────────────────
function PostRow({ post, index, onChange, onDelete, onDuplicate, total }) {
  const [open, setOpen] = useState(true)

  const set = (k, v) => onChange({ ...post, [k]: v })

  const badges = [
    { key: 'is_most_liked',     label: '❤️ Most Liked' },
    { key: 'is_most_commented', label: '💬 Most Commented' },
    { key: 'is_most_viewed',    label: '👁 Most Viewed' },
    { key: 'is_first_post',     label: '⭐ First Post' },
  ]

  const isComplete = post.link.trim() !== ''

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isComplete ? 'var(--border2)' : 'var(--border)'}`,
      borderLeft: `3px solid ${isComplete ? 'var(--accent)' : 'var(--border2)'}`,
      borderRadius: 'var(--r)',
      overflow: 'hidden',
      transition: 'border-color .2s',
    }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: isComplete ? 'var(--grad)' : 'var(--surface2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          color: isComplete ? '#fff' : 'var(--muted)',
        }}>
          {isComplete ? '✓' : index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: isComplete ? 'var(--text)' : 'var(--muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {post.link || `Post ${index + 1} — enter link below`}
          </div>
          {post.date && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
              {post.type.toUpperCase()} · {post.date}
              {post.tags && ` · #${post.tags.split(',')[0].trim()}`}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 9px', fontSize: 11 }}
            onClick={e => { e.stopPropagation(); onDuplicate() }}
            title="Duplicate this post"
          >⧉</button>
          {total > 1 && (
            <button
              className="btn btn-danger"
              style={{ padding: '4px 9px', fontSize: 11 }}
              onClick={e => { e.stopPropagation(); onDelete() }}
              title="Delete this post"
            >✕</button>
          )}
          <div style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1, paddingTop: 2 }}>
            {open ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: '14px', display: 'grid', gap: 10 }}>
          {/* Link */}
          <div>
            <label style={lbl}>Instagram Link *</label>
            <input
              className="field"
              value={post.link}
              onChange={e => set('link', e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              autoComplete="off"
            />
          </div>

          {/* Type + Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div>
              <label style={lbl}>Type</label>
              <select className="field" value={post.type} onChange={e => set('type', e.target.value)}>
                <option value="reel">🎬 Reel</option>
                <option value="post">🖼 Post (Photo)</option>
                <option value="video">📹 Video</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Date Posted</label>
              <input className="field" type="date" value={post.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label style={lbl}>Caption <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="field"
              value={post.caption}
              onChange={e => set('caption', e.target.value)}
              placeholder="Paste the caption here..."
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={lbl}>Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma separated)</span></label>
            <input
              className="field"
              value={post.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="e.g. cricket, ipl, rcb, celebration"
            />
          </div>

          {/* Badge toggles */}
          <div>
            <label style={lbl}>Mark as</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {badges.map(b => (
                <button
                  key={b.key}
                  onClick={() => set(b.key, !post[b.key])}
                  style={{
                    padding: '5px 11px', borderRadius: 20, fontSize: 12,
                    fontWeight: 600, border: 'none', transition: 'all .15s',
                    background: post[b.key] ? 'var(--grad)' : 'var(--surface2)',
                    color: post[b.key] ? '#fff' : 'var(--muted)',
                    outline: post[b.key] ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '.05em', marginBottom: 5,
}

// ─── Copy Screen ──────────────────────────────────────────────────────────────
function CopyScreen({ posts, onBack }) {
  const [copied, setCopied] = useState({})
  const [allCopied, setAllCopied] = useState(false)
  const [toast, setToast] = useState('')

  const filledPosts = posts.filter(p => p.link.trim() !== '')

  const formatPost = (p) => {
    const tags = p.tags
      ? p.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
      : []
    const badges = [
      p.is_most_liked     && 'Most Liked',
      p.is_most_commented && 'Most Commented',
      p.is_most_viewed    && 'Most Viewed',
      p.is_first_post     && 'First Post',
    ].filter(Boolean)

    return [
      `LINK: ${p.link}`,
      `TYPE: ${p.type}`,
      `DATE: ${p.date || '—'}`,
      p.caption ? `CAPTION: ${p.caption}` : null,
      tags.length   ? `TAGS: ${tags.join(', ')}` : null,
      badges.length ? `MARK AS: ${badges.join(', ')}` : null,
    ].filter(Boolean).join('\n')
  }

  const copyOne = async (p, idx) => {
    try {
      await navigator.clipboard.writeText(formatPost(p))
      setCopied(c => ({ ...c, [p.id]: true }))
      setToast('✅ Copied to clipboard!')
      setTimeout(() => setCopied(c => ({ ...c, [p.id]: false })), 2500)
    } catch {
      setToast('❌ Copy failed — try selecting text manually')
    }
  }

  const copyAll = async () => {
    const text = filledPosts
      .map((p, i) => `━━━ POST ${i + 1} ━━━\n${formatPost(p)}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setAllCopied(true)
      setToast(`✅ All ${filledPosts.length} posts copied!`)
      setTimeout(() => setAllCopied(false), 3000)
    } catch {
      setToast('❌ Copy failed')
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 16px' }}>
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '7px 14px' }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>
            Copy & Paste <span className="grad-text">to InstaSearch</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {filledPosts.length} post{filledPosts.length !== 1 ? 's' : ''} ready · Copy each one and paste in admin panel
          </p>
        </div>
        <button
          className={`btn ${allCopied ? 'btn-green' : 'btn-primary'}`}
          onClick={copyAll}
          disabled={filledPosts.length === 0}
        >
          {allCopied ? '✓ All Copied!' : `📋 Copy All ${filledPosts.length}`}
        </button>
      </div>

      {filledPosts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 'var(--r)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          <p>No posts entered yet.<br />Go back and add some links first.</p>
          <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>← Enter Posts</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filledPosts.map((p, i) => {
          const tags = p.tags
            ? p.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
            : []

          return (
            <div
              key={p.id}
              className="fade"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${copied[p.id] ? 'var(--green)' : 'var(--border2)'}`,
                borderRadius: 'var(--r)',
                overflow: 'hidden',
                transition: 'border-color .2s',
              }}
            >
              {/* Post header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                background: copied[p.id] ? 'rgba(34,197,94,.06)' : 'transparent',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: copied[p.id] ? 'var(--green)' : 'var(--grad)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {copied[p.id] ? '✓' : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.link}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                    {p.type.toUpperCase()} · {p.date || '—'}
                  </div>
                </div>
                <button
                  className={`btn ${copied[p.id] ? 'btn-green' : 'btn-ghost'}`}
                  style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
                  onClick={() => copyOne(p, i)}
                >
                  {copied[p.id] ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>

              {/* Data preview */}
              <div style={{ padding: '12px 14px', display: 'grid', gap: 8 }}>
                {/* Link with copy tick */}
                <DataRow label="Link" value={p.link} link />
                {p.caption && <DataRow label="Caption" value={p.caption} />}
                <DataRow label="Date" value={p.date || '—'} />
                <DataRow label="Type" value={p.type} />
                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={fieldLabel}>Tags</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, flex: 1 }}>
                      {tags.map(t => (
                        <span key={t} style={{
                          padding: '2px 8px', borderRadius: 20,
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          fontSize: 11, color: 'var(--dim)',
                        }}>#{t}</span>
                      ))}
                    </div>
                    <CopyMiniButton value={tags.map(t => `#${t}`).join(' ')} label="Tags" />
                  </div>
                )}
                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                    {p.is_most_liked && <Badge color="#ec4899">❤️ Most Liked</Badge>}
                    {p.is_most_commented && <Badge color="#38bdf8">💬 Most Commented</Badge>}
                    {p.is_most_viewed && <Badge color="#a855f7">👁 Most Viewed</Badge>}
                    {p.is_first_post && <Badge color="#f59e0b">⭐ First Post</Badge>}
                  </div>
                  {(p.is_most_liked || p.is_most_commented || p.is_most_viewed || p.is_first_post) && (
                    <CopyMiniButton 
                      value={[
                        p.is_most_liked && 'Most Liked',
                        p.is_most_commented && 'Most Commented',
                        p.is_most_viewed && 'Most Viewed',
                        p.is_first_post && 'First Post'
                      ].filter(Boolean).join(', ')} 
                      label="Badges" 
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filledPosts.length > 0 && (
        <div style={{
          marginTop: 24, padding: '14px 18px',
          background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.25)',
          borderRadius: 'var(--r)', fontSize: 13, color: 'var(--dim)', lineHeight: 1.8,
        }}>
          <strong style={{ color: 'var(--accent)' }}>How to use:</strong><br />
          1. Copy each post (or Copy All)<br />
          2. Open InstaSearch Admin Panel → Posts & Reels tab<br />
          3. Click "+ Add Post" → fill in the details from what you copied<br />
          4. Done! 🎉
        </div>
      )}
    </div>
  )
}

const fieldLabel = {
  fontSize: 11, fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '.04em',
  minWidth: 62, paddingTop: 1, flexShrink: 0,
}

function CopyMiniButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button 
      onClick={handleCopy}
      className={`btn ${copied ? 'btn-green' : 'btn-ghost'}`}
      style={{ padding: '3px 8px', fontSize: 11, flexShrink: 0 }}
      title={`Copy ${label}`}
    >
      {copied ? '✓' : '📋'}
    </button>
  )
}

function DataRow({ label, value, link }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={fieldLabel}>{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all', flex: 1 }}>
          {value}
        </a>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--dim)', flex: 1, wordBreak: 'break-word' }}>{value}</span>
      )}
      <CopyMiniButton value={value} label={label} />
    </div>
  )
}

function Badge({ children, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
      background: color + '18', border: `1px solid ${color}44`, color,
    }}>{children}</span>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState('enter') // 'enter' | 'copy'
  const [posts, setPosts] = useState([blankPost()])
  const [toast, setToast] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on first render
  useEffect(() => {
    setPosts(load())
    setLoaded(true)
  }, [])

  // Auto-save whenever posts change
  useEffect(() => {
    if (loaded) save(posts)
  }, [posts, loaded])

  const updatePost = (id, updated) =>
    setPosts(ps => ps.map(p => p.id === id ? updated : p))

  const deletePost = (id) =>
    setPosts(ps => ps.filter(p => p.id !== id))

  const addPost = () => {
    const np = blankPost()
    setPosts(ps => [...ps, np])
    // Scroll to bottom after render
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
  }

  const duplicatePost = (post) => {
    const np = { ...post, id: uid() }
    setPosts(ps => {
      const idx = ps.findIndex(p => p.id === post.id)
      const next = [...ps]
      next.splice(idx + 1, 0, np)
      return next
    })
  }

  const clearAll = () => {
    setPosts([blankPost()])
    setConfirmClear(false)
    setToast('🗑 All posts cleared!')
    localStorage.removeItem(STORE_KEY)
  }

  const filledCount = posts.filter(p => p.link.trim() !== '').length

  if (screen === 'copy') {
    return <CopyScreen posts={posts} onBack={() => setScreen('enter')} />
  }

  return (
    <>
      <Head>
        <title>InstaSearch Tool — Post Entry</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,13,13,.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', minHeight: 54, padding: '12px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15,
            }}>📥</div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-.02em' }}>
                Insta<span className="grad-text">Tool</span>
              </span>
              <span style={{
                marginLeft: 8, fontSize: 10, fontWeight: 700,
                color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em',
                display: 'inline-block'
              }}>Data Entry</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Auto-save indicator */}
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              💾 Auto-saved
            </span>

            {confirmClear ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--red)' }}>Sure?</span>
                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={clearAll}>Yes, Clear All</button>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setConfirmClear(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setConfirmClear(true)}>
                🗑 Clear All
              </button>
            )}

            <button
              className="btn btn-primary"
              style={{ padding: '7px 16px', fontSize: 13 }}
              onClick={() => setScreen('copy')}
              disabled={filledCount === 0}
            >
              Copy Screen →
              {filledCount > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,.25)',
                  borderRadius: 20, padding: '1px 7px', fontSize: 11,
                }}>{filledCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Intro */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 5 }}>
            Enter Posts <span className="grad-text">& Reels</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Add Instagram links here → go to Copy Screen → paste into InstaSearch admin panel.
            Your data is <strong style={{ color: 'var(--dim)' }}>auto-saved</strong> in your browser.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total', value: posts.length, color: 'var(--accent)' },
            { label: 'Filled', value: filledCount, color: 'var(--green)' },
            { label: 'Empty', value: posts.length - filledCount, color: 'var(--muted)' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', flex: '1 1 80px', justifyContent: 'center'
            }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: s.color, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Post rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.map((post, i) => (
            <PostRow
              key={post.id}
              post={post}
              index={i}
              total={posts.length}
              onChange={updated => updatePost(post.id, updated)}
              onDelete={() => deletePost(post.id)}
              onDuplicate={() => duplicatePost(post)}
            />
          ))}
        </div>

        {/* Add post button */}
        <button
          className="btn btn-ghost"
          onClick={addPost}
          style={{
            width: '100%', justifyContent: 'center',
            marginTop: 14, padding: '12px',
            fontSize: 14, fontWeight: 700,
            border: '1px dashed var(--border2)',
          }}
        >
          + Add Another Post
        </button>

        {/* Bottom CTA */}
        {filledCount > 0 && (
          <div
            className="fade"
            style={{
              marginTop: 24, padding: '16px 18px',
              background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.3)',
              borderRadius: 'var(--r)', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                {filledCount} post{filledCount !== 1 ? 's' : ''} ready to copy
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Go to Copy Screen and paste into InstaSearch admin
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setScreen('copy')}>
              Go to Copy Screen →
            </button>
          </div>
        )}
      </main>
    </>
  )
}
