export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  homepage: string | null;
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      'https://api.github.com/users/cemyildizcy/repos?sort=updated&per_page=100',
      { next: { revalidate: 3600 } } as RequestInit
    );

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    return data.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      homepage: repo.homepage,
    }));
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    return [];
  }
}
