'use client';

import { useState, useEffect } from 'react';

type Settings = {
  prefix: string;
  logsEnabled: boolean;
  logLevel: 'info' | 'warning' | 'error';
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    prefix: '!',
    logsEnabled: true,
    logLevel: 'info',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Récupérer les settings au chargement
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Erreur récupération paramètres');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSettings();
  }, []);

  // Handler changement input
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
  const target = e.target;
  const name = target.name;
  let value: string | boolean;

  if (target instanceof HTMLInputElement && target.type === 'checkbox') {
    value = target.checked;
  } else {
    value = target.value;
  }

  setSettings(prev => ({
    ...prev,
    [name]: value,
  }));
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Erreur mise à jour paramètres');
      setMessage('Paramètres sauvegardés avec succès !');
    } catch (err) {
      setMessage('Erreur lors de la sauvegarde');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-[#12151d] rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Paramètres du bot</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prefix" className="block mb-2 font-semibold text-white">Préfixe du bot</label>
          <input
            type="text"
            id="prefix"
            name="prefix"
            value={settings.prefix}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-[#0b0d13] border border-cyan-600 text-white"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="logsEnabled"
            name="logsEnabled"
            checked={settings.logsEnabled}
            onChange={handleChange}
            className="accent-cyan-500"
          />
          <label htmlFor="logsEnabled" className="font-semibold text-white">Activer les logs</label>
        </div>

        <div>
          <label htmlFor="logLevel" className="block mb-2 font-semibold text-white">Niveau des logs</label>
          <select
            id="logLevel"
            name="logLevel"
            value={settings.logLevel}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-[#0b0d13] border border-cyan-600 text-white"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        {message && <p className="text-center mt-4 text-white">{message}</p>}
      </form>
    </div>
  );
}
