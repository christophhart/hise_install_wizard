const { execSync } = require('child_process');

const getGitCommitMessage = () => {
  try {
    return execSync('git log -1 --pretty=%s').toString().trim();
  } catch {
    return 'unknown commit';
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Creates self-contained production build
  env: {
    NEXT_PUBLIC_COMMIT_MESSAGE: getGitCommitMessage(),
  },
};

module.exports = nextConfig;
