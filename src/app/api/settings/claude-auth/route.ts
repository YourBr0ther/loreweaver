import { NextRequest } from 'next/server';
import { execFile } from 'child_process';
import { getCredentials, saveCredentials, getAccessToken } from '@/lib/ai/claude-credentials';

export async function GET() {
  // Check if claude CLI is installed
  const version = await new Promise<string | null>((resolve) => {
    execFile('claude', ['--version'], { timeout: 10_000 }, (error, stdout) => {
      resolve(error ? null : stdout.trim());
    });
  });

  if (!version) {
    return Response.json({
      installed: false,
      version: null,
      authenticated: false,
      error: 'Claude CLI not found',
    });
  }

  const creds = getCredentials();
  const accessToken = getAccessToken();
  const hasToken = !!accessToken;

  let authenticated = false;
  let error: string | undefined;

  if (hasToken) {
    // Verify token works by running a quick prompt
    authenticated = await new Promise<boolean>((resolve) => {
      const child = execFile(
        'claude',
        ['--print', '--output-format', 'text'],
        {
          timeout: 20_000,
          maxBuffer: 1024 * 1024,
          env: { ...process.env, ANTHROPIC_API_KEY: accessToken! },
        },
        (err) => resolve(!err)
      );
      if (child.stdin) {
        child.stdin.write('Say "ok"');
        child.stdin.end();
      }
    });

    if (!authenticated) {
      error = 'Token saved but verification failed — it may be expired';
    }
  } else {
    error = 'No credentials configured';
  }

  return Response.json({
    installed: true,
    version,
    authenticated,
    subscriptionType: creds?.claudeAiOauth?.subscriptionType ?? null,
    error,
  });
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token || typeof token !== 'string') {
    return Response.json(
      { success: false, error: 'Token is required' },
      { status: 400 }
    );
  }

  const result = saveCredentials(token);

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  return Response.json({ success: true });
}
