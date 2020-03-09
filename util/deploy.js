const fs = require('fs-extra');
const path = require('path');
const cp = require('child_process');

const funcName = process.argv[2];

if (!funcName) {
  console.error("Please provide your function's name!");
  process.exit(1);
}

const deployArgs = funcName => {
  const configFile = path.join('./.gcloud.json');
  const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
  const funcNameConfig = config[funcName] || {};

  const {
    runtime = 'nodejs10',
    region = 'europe-west1',
    memory = '256MB',
    trigger = 'http',
    triggerTopic,
  } = funcNameConfig;

  const args = [
    'functions',
    'deploy',
    funcName,
    '--runtime',
    runtime,
    '--region',
    region,
    '--env-vars-file',
    '.env.yaml',
    '--memory',
    memory,
    `--trigger-${trigger}`,
  ];

  if (trigger === 'topic') {
    if (triggerTopic) {
      args.push(triggerTopic);
    } else {
      console.error(".gcloud.json is missing a 'triggerTopic' field!");
      process.exit(1);
    }
  }

  return args;
};

const args = deployArgs(funcName);

cp.spawn('gcloud', args, { stdio: 'inherit' });
