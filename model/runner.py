import subprocess

ids = ["0", "1", "2", "3", "4"]

script_name = "model/traffic_light_simulator.py"

for id in ids:
    subprocess.Popen(["python", script_name, id])
