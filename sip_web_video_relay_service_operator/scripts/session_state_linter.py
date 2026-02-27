import json, sys
schema = json.load(open('../references/session_state_machine_schema.json'))
print("Session state schema loaded. States:", list(schema["states"].keys()))
