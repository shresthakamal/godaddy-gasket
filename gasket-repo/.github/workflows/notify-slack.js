#!/usr/bin/env node

// Map GitHub usernames to Slack handles
const SLACK_HANDLES = {
  'kbader-godaddy': 'Kawika Bader (<@WV449BEU9>)',
  'mmason2-godaddy': 'Michael Mason (<@U03EXT63USV>)',
  'agerard-godaddy': 'Andrew Gerard (<@W0102C8BDM4>)',
  'bbetts-godaddy': 'Bree Betts (<@U03CT23AQ3W>)',
  'jpina1-godaddy': 'Jordan Pina (<@U03HGKB4D9T>)'
};

const WORKFLOW_IDS = {
  Internal: '142755354',
  OS: '120339017'
}

/**
 * Fetches recent successful GitHub Actions runs for the main branch
 * @returns {Promise<Object>} The GitHub Actions runs data
 */
async function getActionsRuns() {
  const request = await fetch(`https://api.github.com/repos/gdcorp-uxp/gasket/actions/runs?status=success&branch=main&per_page=25`, {
    headers: {
      'Authorization': `Bearer ${process.env.GH_TOKEN}`
    }
  });

  if (!request.ok) {
    throw new Error(`GitHub API request failed: ${request.status} ${request.statusText}`);
  }

  const data = await request.json();

  if (data.message) {
    throw new Error(`GitHub API error: ${data.message}`);
  }

  return data;
}

/**
 * Gets the most recent successful run timestamp for the current workflow
 * @param {Object} runs - The GitHub Actions runs data
 * @returns {string} The timestamp of the most recent successful run
 */
function getMostRecentSuccessfulRun(runs) {
  const filteredRuns = runs.workflow_runs.filter(run => {
    return run.workflow_id === parseInt(WORKFLOW_IDS[process.env.GASKET_SCOPE], 10);
  });

  if (filteredRuns.length === 0) {
    return '1970-01-01T00:00:00Z'; // Return epoch time if no successful runs found
  }

  return filteredRuns.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0].updated_at;
}

/**
 * Fetches closed PR data from the repository
 * @returns {Promise<Array>} Array of closed PR data
 */
async function getPRData() {
  const request = await fetch(`https://api.github.com/repos/${process.env.GH_REPO}/pulls?state=closed&sort=updated&direction=desc`, {
    headers: {
      'Authorization': `Bearer ${process.env.GH_TOKEN}`
    }
  });

  if (!request.ok) {
    throw new Error(`GitHub API request failed: ${request.status} ${request.statusText}`);
  }

  const data = await request.json();

  if (data.message) {
    throw new Error(`GitHub API error: ${data.message}`);
  }

  return data;
}

/**
 * Filters PR data to only include merged PRs after the last successful run
 * @param {Array} prData - Array of PR data
 * @param {string} lastSuccessfulRun - Timestamp of last successful run
 * @returns {Array} Filtered array of PR data with user and URL
 */
function filterPRData(prData, lastSuccessfulRun) {
  return prData.filter(pr => {
    if (pr.merged_at === null) {
      return false;
    }

    if (pr.user.login === 'github-actions[bot]') {
      return false;
    }

    return pr.merged_at > lastSuccessfulRun;
  })
  .reduce((acc, pr) => {
    acc.push({
      user: pr.user.login,
      url: pr._links.html.href,
    });
    return acc;
  }, []);
}

/**
 * Creates a formatted Slack message with PR information
 * @param {Array} prData - Array of filtered PR data
 * @returns {string} Formatted Slack message
 */
function createSlackMessage(prData) {
  const message = prData.map(pr => {
    return `- ${pr.url} by ${SLACK_HANDLES[pr.user] ?? pr.user}`;
  }).join('\n');

  return `
🚨 ${process.env.GASKET_SCOPE} Gasket App Testing Failed 🚨\n
Workflow: ${process.env.WORKFLOW_URL}\n
${message ? `Recent PRs:\n${message}` : 'No PRs found'}
  `
}

/**
 * Sends a message to Slack via webhook
 * @param {string} message - The message to send
 * @returns {Promise<void>}
 */
async function sendSlackMessage(message) {

  const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ text: message }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook request failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Main function that orchestrates the notification process
 * @returns {Promise<void>}
 */
async function main() {
  try {
    // Validate required environment variables
    if (!process.env.GH_TOKEN) {
      throw new Error('GH_TOKEN environment variable is not set');
    }
    if (!process.env.GH_REPO) {
      throw new Error('GH_REPO environment variable is not set');
    }
    if (!process.env.GASKET_SCOPE) {
      throw new Error('GASKET_SCOPE environment variable is not set');
    }
    if (!WORKFLOW_IDS[process.env.GASKET_SCOPE]) {
      throw new Error(`Invalid GASKET_SCOPE: ${process.env.GASKET_SCOPE}. Must be one of: ${Object.keys(WORKFLOW_IDS).join(', ')}`);
    }
    if (!process.env.SLACK_WEBHOOK_URL) {
      throw new Error('SLACK_WEBHOOK_URL environment variable is not set');
    }

    const actionsRuns = await getActionsRuns();
    const lastSuccessfulRun = getMostRecentSuccessfulRun(actionsRuns);
    const prData = await getPRData();
    const filteredPRData = filterPRData(prData, lastSuccessfulRun);
    const slackMessage = createSlackMessage(filteredPRData);
    await sendSlackMessage(slackMessage);
  } catch (error) {
    console.error('Error in notify-slack script:', error.message);
    process.exit(1);
  }
}

main();

