// services/cloudsync.js — keeps the local store mirrored to the medira cloud DB.
// Mount once near the app root with the current session:  useCloudSync(session)
//   • on login  -> loads the user's medicines / profile / SOS and hydrates the store
//   • on change -> debounced save back to the DB (RLS scopes everything to the user)
//   • on logout -> clears the store
import { useEffect } from 'react';
import { subscribe, getState, actions } from '../state/store';
import { fetchAll, saveAll } from './repository';

export function useCloudSync(session) {
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      actions.hydrate({ meds: [], profile: null, sos: null, history: [] }); // clear on logout
      return;
    }

    let ready = false;     // don't save until the initial load finishes (avoids wiping the DB)
    let timer = null;
    let cancelled = false;

    actions.beginLoad();   // gate the UI until this user's data lands
    fetchAll(uid)
      .then((data) => {
        if (cancelled) return;
        actions.hydrate(data);
        // Google gives us a name even before the profile row catches up — use it.
        if (!data.profile?.full_name) {
          const meta = session?.user?.user_metadata || {};
          const gName = meta.full_name || meta.name || '';
          if (gName) actions.setName(gName);
        }
        ready = true;
      })
      .catch((e) => { console.warn('cloud load failed:', e?.message); actions.hydrate({ meds: [], profile: null, sos: null, history: [] }); ready = true; });

    const unsub = subscribe(() => {
      if (!ready) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveAll(uid, getState()).catch((e) => console.warn('cloud save failed:', e?.message));
      }, 700);
    });

    return () => { cancelled = true; clearTimeout(timer); unsub(); };
  }, [session?.user?.id]);
}
