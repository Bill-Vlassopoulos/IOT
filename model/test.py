import time
from model.globals import message_received  # Import the global variable


def main():
    # Check if an MQTT message was received during the period
    while True:
        check_mqtt_message()
        time.sleep(30)
    check_mqtt_message()


def check_mqtt_message():
    global message_received  # Use the global variable
    if message_received:
        print("MQTT message received during the period.")
        message_received = False  # Reset the flag
    else:
        print("No MQTT message received during the period.")


if __name__ == "__main__":
    main()
