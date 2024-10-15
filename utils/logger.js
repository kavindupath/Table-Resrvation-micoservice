const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let caseCounter = 100;  // Starting from UGU100
let taskCounter = 1;
const logFilePath = 'logs.csv';
// Define CSV log format with custom fields including 'Resource'
const csvFormat = printf(({ caseId, taskId,  timestamp,resource, message }) => {
  return `${caseId},${taskId},${timestamp},${resource},${message}`;
});

// Write the headers if the file does not exist
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, 'CaseID,TaskID,Timestamp,Resource,Message\n');
}

const logger = createLogger({
  format: combine(
    timestamp(),
    format((info) => {
      info.caseId = `UGU${caseCounter++}`;  // Generate a new CaseID 
      info.taskId = taskCounter++;    // Generate a new TaskID
      //info.resource = 'SystemResource';     // Add Resource column with a fixed value (can be dynamic)
      return info; 
    })(),
    csvFormat 
  ),
  transports: [
    new transports.File({ filename: 'logs.csv' }),  // Logs to logs.csv file 
  ]
});

module.exports = logger; 

