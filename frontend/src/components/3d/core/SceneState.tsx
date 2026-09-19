import { createContext, useContext, type ReactNode } from 'react';

const SceneActiveContext = createContext(true);

export function SceneActiveProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return <SceneActiveContext.Provider value={active}>{children}</SceneActiveContext.Provider>;
}

export function useSceneActive(): boolean {
  return useContext(SceneActiveContext);
}