const form = document.getElementById("relay-form");
const queueStatus = document.getElementById("queue-status");
const flowItems = Array.from(document.querySelectorAll("#call-flow li"));

function setFlow(step) {
  flowItems.forEach((item, index) => {
    if (index < step) item.dataset.state = "done";
    else if (index === step) item.dataset.state = "active";
    else item.dataset.state = "pending";
  });
}

function simulateQueue(name, language, priority) {
  queueStatus.textContent = `${name} (${language}) added to ${priority.toLowerCase()} queue.`;
  setFlow(0);

  setTimeout(() => {
    queueStatus.textContent = "Interpreter is being assigned...";
    setFlow(1);
  }, 1200);

  setTimeout(() => {
    queueStatus.textContent = "Dialing hearing party...";
    setFlow(2);
  }, 2600);

  setTimeout(() => {
    queueStatus.textContent = "Relay call is now active.";
    setFlow(3);
  }, 4200);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get("name")?.toString().trim();
  const language = data.get("language")?.toString().trim();
  const priority = data.get("priority")?.toString().trim();
  const phone = data.get("phone")?.toString().trim();

  if (!name || !language || !phone || !priority) {
    queueStatus.textContent = "Please fill in all required fields.";
    return;
  }

  simulateQueue(name, language, priority);
  form.reset();
});
