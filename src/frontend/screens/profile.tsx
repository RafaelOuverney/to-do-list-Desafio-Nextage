import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="20">Avatar</text></svg>';

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string>(placeholder);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useRef<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let objectUrl: string | null = null;
    (async () => {
      const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed) {
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          const token = localStorage.getItem('token');
          // Prefer fetching avatar from server when we have a user id
          if (parsed.id) {
            try {
              const res = await fetch(`http://localhost:3000/users/${encodeURIComponent(String(parsed.id))}/avatar`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
              });
              if (res.ok) {
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setAvatarSrc(objectUrl);
              } else if (res.status === 404) {
                // no avatar on server, try local stored avatar or fallback to placeholder
                if (parsed.avatar) setAvatarSrc(parsed.avatar);
                else setAvatarSrc(placeholder);
              } else {
                if (parsed.avatar) setAvatarSrc(parsed.avatar);
                else setAvatarSrc(placeholder);
              }
            } catch (e) {
              if (parsed.avatar) setAvatarSrc(parsed.avatar);
              else setAvatarSrc(placeholder);
            }
          } else if (parsed.avatar) {
            // fallback to any avatar that may be stored locally
            setAvatarSrc(parsed.avatar);
          }
        }
      } catch (e) {}
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setAvatarSrc(res);
      setAvatarBase64(res);
    };
    reader.readAsDataURL(f);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const id = parsed?.id || parsed?.userId || parsed?.uid;
      if (!id) {
        toast.current?.show({ severity: 'warn', summary: 'Usuário', detail: 'Usuário não autenticado', life: 3000 });
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      const body: any = { name };
      if (password.trim()) body.password = password;
      if (avatarBase64) body.avatarBase64 = avatarBase64;

      const res = await fetch(`http://localhost:3000/users/${encodeURIComponent(String(id))}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Falha ao salvar perfil');
      }
      const updated = await res.json();
      // update localStorage copy (keep token)
      const keep = localStorage.getItem('token');
      localStorage.setItem('currentUser', JSON.stringify({ ...parsed, name: updated.name, email: updated.email }));
      if (keep) localStorage.setItem('token', keep);
      toast.current?.show({ severity: 'success', summary: 'Salvo', detail: 'Perfil atualizado', life: 2500 });
      setPassword('');
      setSaving(false);
      // navigate back to dashboard
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: String(err), life: 4000 });
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Toast ref={toast} />
      <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>
      <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6 grid grid-cols-1 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
            <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Foto do usuário</label>
            <input type="file" accept="image/*" onChange={handleFile} className='border rounded px-3 py-2 cursor-pointer text-indigo-950' />
            <div className="text-xs text-gray-400 mt-2">PNG/JPEG recomendado. A imagem será salva no banco.</div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-gray-900" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email (não editável)</label>
          <input value={email} readOnly className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nova senha (opcional)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-black" />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded border text-neutral-700">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white">{saving ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
