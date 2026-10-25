import { useEffect } from 'react';
import { loadManifest, stopAudio } from './audio/player';
import { useRoute } from './router';
import { IslandMap } from './screens/IslandMap';
import { LessonScreen } from './screens/lesson/LessonScreen';
import { AddChild } from './screens/parent/AddChild';
import { ChildDashboard } from './screens/parent/ChildDashboard';
import { ParentHome } from './screens/parent/ParentHome';
import { ProfilePicker } from './screens/ProfilePicker';

export function App() {
  const route = useRoute();

  useEffect(() => {
    loadManifest();
  }, []);

  // Never let one screen's audio carry over into the next.
  useEffect(() => stopAudio, [route.name]);

  switch (route.name) {
    case 'picker':
      return <ProfilePicker />;
    case 'map':
      return <IslandMap />;
    case 'lesson':
      return <LessonScreen lessonId={route.lessonId} />;
    case 'parent-home':
      return <ParentHome />;
    case 'parent-new':
      return <AddChild />;
    case 'parent-child':
      return <ChildDashboard profileId={route.profileId} />;
  }
}
