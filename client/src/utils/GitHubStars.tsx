import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface GitHubStarsProps {
  repoUrl: string;
}

const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const { value, timestamp } = JSON.parse(item);
        const tenMinutesInMs = 10 * 60 * 1000;
        const isRecent = (new Date().getTime() - timestamp) < tenMinutesInMs;
        
        if (isRecent) {
          return value;
        }
      }
      return initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore = {
        value: value,
        timestamp: new Date().getTime()
      };
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      setStoredValue(value);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
};

const GitHubStars: React.FC<GitHubStarsProps> = ({ repoUrl }) => {
  const getRepoInfo = () => {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
    return null;
  };
  
  const repoInfo = getRepoInfo();
  const cacheKey = repoInfo ? `github-stars-${repoInfo.owner}-${repoInfo.repo}` : null;
  
  const [stars, setStars] = useLocalStorage(cacheKey || 'github-stars', null);
  const [isLoading, setIsLoading] = useState(!stars);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoInfo || !cacheKey) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchStars = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, 
          { signal: controller.signal }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setStars(data.stargazers_count);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Failed to fetch GitHub stars:', error);
            setError('API limit reached');
            setStars(0);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStars();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [repoInfo, cacheKey, stars]);

  return (
    <button 
      onClick={() => window.open(repoUrl, '_blank')} 
      className="flex items-center space-x-1 py-1 rounded-md h-8"
      title={error ? "GitHub API rate limit reached" : "GitHub Stars"}
    >
      <img
        src='https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png'
        className='w-8 h-8 rounded-full'
        alt="GitHub"
      />
      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      <span className="text-sm text-gray-200 min-w-6 text-center">
        {isLoading ? '' : stars || '0'}
      </span>
    </button>
  );
};

export default GitHubStars;