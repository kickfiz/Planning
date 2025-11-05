import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `Planning - ${title}`;

    return () => {
      document.title = 'Planning';
    };
  }, [title]);
}
