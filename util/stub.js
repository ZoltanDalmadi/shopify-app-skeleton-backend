const express = require('express');
const readline = require('readline');
const fs = require('fs-extra');
const yaml = require('yaml');
const { join } = require('path');
const { bold, green, magenta, yellow } = require('kleur');

const functionName = process.argv[2];

if (!functionName) {
  console.error("please provide your function's name!");
  process.exit(1);
}

const envFile = fs.readFileSync(join('.env.yaml'), 'utf8');
const parsedYaml = yaml.parse(envFile);
for (const key in parsedYaml) {
  process.env[key] = parsedYaml[key];
}

const functionSource = require('../index.js');

const cloudFunction = functionSource[functionName];

let functionConfig;
try {
  functionConfig = require('./gcloud.json');
} catch (e) {
  functionConfig = {};
}

const leftPad = value => String(value).padStart(2, '0');

const getDate = () => {
  const now = new Date();
  const date = [now.getFullYear(), now.getMonth(), now.getDate()]
    .map(leftPad)
    .join('-');
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(leftPad)
    .join(':');
  return `[${date} ${time}]`;
};

const log = (req, res, next) => {
  const parts = [yellow(getDate()), magenta(req.method), req.path];

  if (Object.keys(req.query).length) {
    parts.push('query: ' + JSON.stringify(req.query));
  }

  if (Object.keys(req.body).length) {
    parts.push('body: ' + JSON.stringify(req.body));
  }

  console.log(parts.join(' '));
  next();
};

const deduceFunctionTypeAndStub = (functionName, cloudFunction, config) => {
  config[functionName] && config[functionName].trigger === 'topic'
    ? stubBackgroundFunction(cloudFunction)
    : stubHttpFunction(cloudFunction);
};

const stubBackgroundFunction = cloudFunction => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const loop = callback => rl.question('Press Enter to start ', callback);
  const run = () => {
    console.log(green('Starting...'));
    console.time(bold(magenta('Total time taken')));
    cloudFunction().then(value => {
      console.log(value);
      console.timeEnd(bold(magenta('Total time taken')));
      loop(run);
    });
  };

  loop(run);
};

const stubHttpFunction = cloudFunction => {
  const app = express();

  app.use(express.json());
  app.use(log);
  app.use(cloudFunction);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};

deduceFunctionTypeAndStub(functionName, cloudFunction, functionConfig);
