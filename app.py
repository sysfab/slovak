from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

WORDS = []
with open("words.txt", "r") as f:
    for line in f:
        WORDS.append(line.strip())

@app.route("/")
def index():
    global TARGET_WORD
    TARGET_WORD = random.choice(WORDS)
    print(TARGET_WORD)
    return render_template("index.html")

# --- Game Events ---
@socketio.on("guess")
def handle_guess(data):
    print(TARGET_WORD)
    guess = data["word"].lower()
    feedback = []

    LETTERS = {}
    for letter in TARGET_WORD:
        if letter in LETTERS:
            LETTERS[letter] += 1
        else:
            LETTERS[letter] = 1

    for i, ch in enumerate(guess):
        if ch == TARGET_WORD[i]:
            LETTERS[ch] -= 1

    for i, ch in enumerate(guess):
        if ch == TARGET_WORD[i]:
            feedback.append(2)   # correct place
        elif ch in TARGET_WORD:
            if LETTERS[ch] > 0:
                feedback.append(1)   # wrong place
                LETTERS[ch] -= 1
            else:
                feedback.append(0)   # not in word
        else:
            feedback.append(0)   # not in word
 
    isInWords = guess in WORDS
    if not isInWords:
        emit("guess_feedback", {"correct": 0}, broadcast=True)
        return

    del LETTERS
    del isInWords
    emit("guess_feedback", {"correct": 1, "guess": guess, "feedback": feedback, "word": TARGET_WORD}, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=6464)
