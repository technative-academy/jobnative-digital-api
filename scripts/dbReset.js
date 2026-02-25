// File overview: Executes the reset workflow by running setup and seed scripts in order.

const { spawn } = require('node:child_process');

// Run an npm script and stream output to this terminal.
// Wrapping spawn in a Promise lets us await each step in order.
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });

    child.on('error', reject);
  });
}

async function main() {
  // Recreate tables first, then insert the sample data.
  await run('npm', ['run', 'db:setup']);
  await run('npm', ['run', 'db:seed']);
}

main().catch((error) => {
  // Child scripts print detailed logs, so this is a short summary.
  console.error(error.message);
  process.exit(1);
});
