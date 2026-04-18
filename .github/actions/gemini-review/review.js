const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PR_NUMBER = process.env.PR_NUMBER;
const REPO = process.env.REPO;

if (!GITHUB_TOKEN || !GOOGLE_API_KEY || !PR_NUMBER || !REPO) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function getPRDiff() {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${REPO}/pulls/${PR_NUMBER}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3.diff'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching PR diff:', error.message);
    return null;
  }
}

async function reviewWithGemini(diff) {
  try {
    const prompt = `You are an expert code reviewer. Please review the following code changes and provide constructive feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Security concerns
4. Performance improvements
5. Code clarity and maintainability

Code Changes:
\`\`\`
${diff}
\`\`\`

Provide your review in a structured format with specific line references where applicable.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.status, error.message);
    return null;
  }
}

async function postReviewComment(review) {
  try {
    const body = `## 🤖 Google Gemini Code Review\n\n${review}`;
    
    await axios.post(
      `https://api.github.com/repos/${REPO}/issues/${PR_NUMBER}/comments`,
      { body },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Review comment posted successfully');
  } catch (error) {
    console.error('Error posting review comment:', error.message);
  }
}

async function main() {
  console.log('Starting Google Gemini Code Review...');
  
  const diff = await getPRDiff();
  if (!diff) {
    console.log('Could not fetch PR diff, skipping review');
    return;
  }

  const review = await reviewWithGemini(diff);
  if (!review) {
    console.log('Could not generate review, skipping comment');
    return;
  }

  await postReviewComment(review);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
