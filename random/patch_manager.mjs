import { spawn } from "child_process";

class PythonScriptManager {
  constructor(scriptPath) {
    this.scriptPath = scriptPath;
    this.pythonProcess = null;
  }

  // Start the Python script
  start() {
    if (this.pythonProcess) {
      console.log("Python script is already running.");
      return;
    }

    this.pythonProcess = spawn("python", [this.scriptPath]);

    // Log Python script output
    this.pythonProcess.stdout.on("data", (data) => {
      console.log(`Python Output: ${data.toString()}`);
    });

    // Log Python script errors
    this.pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data.toString()}`);
    });

    // Handle Python script exit
    this.pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
      this.pythonProcess = null; // Reset process reference
    });

    console.log("Python script started.");
  }

  // Stop the Python script
  stop() {
    if (!this.pythonProcess) {
      console.log("Python script is not running.");
      return;
    }

    this.pythonProcess.kill("SIGINT"); // Send interrupt signal to terminate the process
    console.log("Python script stopped.");
    this.pythonProcess = null;
  }

  // Restart the Python script
  restart() {
    console.log("Restarting Python script...");
    this.stop();
    this.start();
  }
}

export default PythonScriptManager;
