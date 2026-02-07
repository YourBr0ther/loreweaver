import { NextRequest } from 'next/server';
import { execFile } from 'child_process';

function runClaude(
  args: string[],
  stdin?: string
): Promise<{ stdout: string; stderr: string; error: boolean }> {
  return new Promise((resolve) => {
    const child = execFile(
      'claude',
      args,
      { timeout: 15_000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout ?? '',
          stderr: stderr ?? '',
          error: !!error,
        });
      }
    );
    if (stdin && child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}

export async function GET() {
  // Check version
  const versionResult = await runClaude(['--version']);
  if (versionResult.error) {
    return Response.json({
      installed: false,
      version: null,
      authenticated: false,
      error: 'Claude CLI not found',
    });
  }

  const version = versionResult.stdout.trim();

  // Check auth by running a simple prompt
  const authResult = await runClaude(
    ['--print', '--output-format', 'text'],
    'Say "ok"'
  );

  return Response.json({
    installed: true,
    version,
    authenticated: !authResult.error,
    error: authResult.error
      ? (authResult.stderr || 'Not authenticated').slice(0, 200)
      : undefined,
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

  const result = await runClaude(['setup-token'], token);

  if (result.error) {
    return Response.json(
      { success: false, error: result.stderr || 'setup-token failed' },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
