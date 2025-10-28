import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const AppDataContext = createContext(null);

const initialActivities = [
  {
    id: 1,
    type: 'watering',
    crop: 'Tomatoes',
    description: 'Deep watering session',
    date: '2025-10-15',
    duration: 30,
    notes: 'Plants looking healthy after watering',
    status: 'done',
  },
  {
    id: 2,
    type: 'pest_control',
    crop: 'Corn',
    description: 'Applied organic pest spray',
    date: '2025-10-14',
    duration: 45,
    notes: 'Found aphids on several plants',
    status: 'done',
  },
  {
    id: 3,
    type: 'harvesting',
    crop: 'Lettuce',
    description: 'First harvest of the season',
    date: '2025-10-13',
    duration: 60,
    notes: 'Harvested 2kg of fresh lettuce',
    status: 'done',
  },
  {
    id: 4,
    type: 'fertilizing',
    crop: 'Peppers',
    description: 'Apply compost fertilizer',
    date: '2025-10-15',
    duration: 20,
    notes: 'Add organic compost around base',
    status: 'in_progress',
  },
  {
    id: 5,
    type: 'pruning',
    crop: 'Tomatoes',
    description: 'Remove lower branches',
    date: '2025-10-16',
    duration: 40,
    notes: 'Prune to improve air circulation',
    status: 'not_done',
  },
  {
    id: 6,
    type: 'weeding',
    crop: 'Carrots',
    description: 'Clear weeds from carrot patch',
    date: '2025-10-16',
    duration: 35,
    notes: 'Remove all weeds before they spread',
    status: 'not_done',
  },
];

export function AppDataProvider({ children }) {
  const [activities, setActivities] = useState(initialActivities);
  const STORAGE_KEY = 'farmconnect:activities';

  // load persisted activities on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (mounted && Array.isArray(parsed)) {
            // merge persisted and in-memory activities, preferring in-memory (recent) items
            setActivities((prev) => {
              const map = new Map();
              // start with persisted
              parsed.forEach((p) => map.set(p.id, p));
              // then overlay in-memory (so newly added activities are kept)
              (prev || []).forEach((p) => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {
        console.warn('AppDataProvider: failed to load activities', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // persist activities whenever they change
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
      } catch (e) {
        console.warn('AppDataProvider: failed to save activities', e);
      }
    };
    save();
  }, [activities]);

  const addActivity = (activity) => {
    setActivities((prev) => [activity, ...prev]);
  };

  const updateActivity = (updated) => {
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppDataContext.Provider value={{ activities, setActivities, addActivity, updateActivity, deleteActivity }}>
      {children}
    </AppDataContext.Provider>
  );
}

export default AppDataProvider;
