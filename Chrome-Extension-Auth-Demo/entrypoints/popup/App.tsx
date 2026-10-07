import { useEffect, useState, useRef } from 'react'
import { signInWithGoogle, signOut } from '../../lib/auth'
import { restoreSession } from '../../lib/session'
import { getNotes, addNote, deleteNote, updateNote } from '../../lib/notes'
import { supabase } from '../../lib/supabaseClient'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    init()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadNotes()
      } else {
        setNotes([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [text])

  async function init() {
    try {
      await restoreSession()
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) loadNotes()
    } finally {
      setLoading(false)
    }
  }

  async function loadNotes() {
    const data = await getNotes()
    setNotes(data)
  }

  async function handleAdd() {
    if (!text.trim()) return
    await addNote(user.id, text)
    setText('')
    loadNotes()
  }

  async function handleDelete(id: string) {
    await deleteNote(id)
    loadNotes()
  }

  function startEdit(note: any) {
    setEditingId(note.id)
    setEditText(note.content)
  }

  async function handleUpdate() {
    if (editingId) {
      await updateNote(editingId, editText)
      setEditingId(null)
      setEditText('')
      loadNotes()
    }
  }

  const calculateHeight = () => {
    const baseHeight = 200
    const noteHeight = 60
    const maxHeight = 600
    const calculatedHeight = baseHeight + (notes.length * noteHeight)
    return Math.min(calculatedHeight, maxHeight)
  }

  if (loading) {
    return (
      <div style={{
        width: '530px',
        height: '426px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        gap: '16px'
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loader {
            width: 30px;
            height: 30px;
            border: 3px solid #e0e0e0;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
        `}</style>
        <div className="loader"></div>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>We are almost there!</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        width: '530px',
        height: '426px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px 30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '320px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>📝</div>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 10px 0'
          }}>Notes</h1>
          
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 30px 0',
            lineHeight: '1.5'
          }}>Keep your notes organized and synced across devices</p>
          
          <button
            onClick={async () => {
              setSigningIn(true)
              await browser.runtime.sendMessage({ type: 'LOGIN' });
              const { data } = await supabase.auth.getUser()
              setUser(data.user)
              if (data.user) loadNotes()
            }}
            disabled={signingIn}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#333',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: signingIn ? 'wait' : 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              opacity: signingIn ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => !signingIn && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)')}
            onMouseOut={(e) => !signingIn && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {signingIn ? 'Opening...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    )
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div style={{
      width: '530px',
      minHeight: '300px',
      maxHeight: '600px',
      height: notes.length === 0 ? '426px' : 'auto',
      padding: '20px',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#333', fontWeight: '600' }}>
            Hi, {userName}! 👋
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
        
        <button
          onClick={async () => {
            await signOut()
            setUser(null)
            setNotes([])
          }}
          title="Sign out"
          style={{
            padding: '8px',
            background: 'transparent',
            color: '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#ff4444'
            e.currentTarget.style.color = 'white'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#666'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px',
        alignItems: 'flex-end'
      }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Write your note here..."
          style={{
            flex: 1,
            padding: '12px 14px',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '14px',
            boxSizing: 'border-box',
            resize: 'none',
            minHeight: '48px',
            maxHeight: '120px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            background: 'white'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          style={{
            padding: '12px 0px',
            background: text.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '600',
            height: '48px',
            minWidth: '80px',
            transition: 'all 0.2s',
            boxShadow: text.trim() ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseOver={(e) => {
            if (text.trim()) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
            }
          }}
          onMouseOut={(e) => {
            if (text.trim()) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
            }
          }}
        >
          Add Note
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: notes.length > 5 ? 'auto' : 'visible',
        maxHeight: '400px'
      }}>
        {notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
            padding: '20px 10px'
          }}>
            No notes yet. Create one to get started! ✨
          </div>
        ) : (
          [...notes].reverse().map((note) => (
            <div
              key={note.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px',
                marginBottom: '8px',
                background: '#151313',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {editingId === note.id ? (
                <>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: '1px solid #667eea',
                      borderRadius: '3px',
                      fontSize: '14px',
                      marginRight: '8px',
                      background: '#222',
                      color: '#fff',
                      resize: 'vertical',
                      minHeight: '40px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.5'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={handleUpdate}
                      style={{
                        padding: '4px 8px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: '4px 8px',
                        background: '#999',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#fff', 
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.5',
                      display: 'block'
                    }}>{note.content}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#888', 
                      marginTop: '6px',
                      display: 'block'
                    }}>
                      {note.updated_at ? `Updated ${new Date(note.updated_at + 'Z').toLocaleString()}` : `Created ${new Date(note.created_at + 'Z').toLocaleString()}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    <button
                      onClick={() => startEdit(note)}
                      style={{
                        padding: '4px 8px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        flexShrink: 0
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        flexShrink: 0
                      }}
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
